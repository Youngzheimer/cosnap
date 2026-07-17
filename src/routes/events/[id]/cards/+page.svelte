<script lang="ts">
  import { enhance } from '$app/forms';
  import { resolve } from '$app/paths';
  import QRCode from '@castlenine/svelte-qrcode';
import {
    createTable,
    tableFeatures,
    FlexRender,
    renderComponent,
    rowSortingFeature,
    globalFilteringFeature,
    createSortedRowModel,
    createFilteredRowModel,
    sortFns,
    filterFns,
    type ColumnDef
  } from '@tanstack/svelte-table';
  import type { Component } from 'svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  // beta부터 언더스코어 없이 `features`
const features = tableFeatures({
    rowSortingFeature,
    globalFilteringFeature,
    sortedRowModel: createSortedRowModel(sortFns),
    filteredRowModel: createFilteredRowModel(),
    filterFns
  });
  let globalFilter = $state('');

  type FlatCard = {
    ID: string;
    index: number;
    submitted: boolean;
    [key: string]: unknown;
  };

  type CardRow = {
    ID: string;
    index: number;
    submitted: boolean;
    data: string;
  };

  const schema = $derived(
    data.event
      ? typeof data.event.schema === 'string'
        ? JSON.parse(data.event.schema)
        : data.event.schema
      : null
  );

  const schemaKeys = $derived<string[]>(schema ? Object.keys(schema.properties) : []);

  const flatCards = $derived<FlatCard[]>(
    ((data.cards ?? []) as CardRow[]).map((card) => {
      const parsedData: Record<string, unknown> =
        typeof card.data === 'string' ? JSON.parse(card.data) : (card.data ?? {});
      const row: FlatCard = {
        ID: card.ID,
        index: card.index,
        submitted: card.submitted
      };
      for (const key of schemaKeys) {
        row[key] = parsedData[key];
      }
      return row;
    })
  );

  const columns = $derived<Array<ColumnDef<typeof features, FlatCard>>>([
    {
      accessorKey: 'index',
      header: '#'
    },
    {
      accessorKey: 'ID',
      header: 'ID',
      cell: (info) => {
        const id = info.getValue() as string;
        return id.slice(0, 8) + '…';
      }
    },
    {
      accessorKey: 'submitted',
      header: '제출여부',
      cell: (info) => (info.getValue() ? '✅' : '❌')
    },
    ...schemaKeys.map(
      (key): ColumnDef<typeof features, FlatCard> => ({
        accessorKey: key,
        header: schema.properties[key].title ?? key,
        cell: (info) => {
          const val = info.getValue();
          if (typeof val === 'boolean') return val ? '✅' : '❌';
          return (val as string) ?? '-';
        }
      })
    ),
    {
      id: 'qr',
      header: 'QR',
      cell: ({ row }) =>
        renderComponent(QRCode as unknown as Component<{ data: string; size?: number }>, {
          data: `${window.location.origin}/qr?id=${row.original.ID}`,
          size: 80
        })
    }
  ]);

  // 명시적 제네릭 없이, features/columns/data로부터 자연스럽게 추론되게 둠
const table = createTable({
    features,
    get columns() {
      return columns;
    },
    get data() {
      return flatCards;
    },
    state: {
      get globalFilter() {
        return globalFilter;
      }
    },
    onGlobalFilterChange: (updater) => {
      globalFilter = typeof updater === 'function' ? updater(globalFilter) : updater;
    }
  });
</script>

{#if !data.event}
  <p>Event not found. Return to <a href="{resolve('/events')}">events list</a>.</p>
{:else}
  <form method="post" use:enhance>
    <label for="cardNum">몇개:</label>
    <input type="text" id="cardNum" name="cardNum" />
    <button type="submit">Add Card</button>
  </form>

  <div class="table-wrapper">
  <input type="text" placeholder="검색..." bind:value={globalFilter} />
    <table>
      <thead>
        {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
          <tr>
            {#each headerGroup.headers as header (header.id)}
              <th
                onclick={header.column.getToggleSortingHandler()}
                class:sortable={header.column.getCanSort()}
              >
                {#if !header.isPlaceholder}
                  <FlexRender {header} />
                  {#if header.column.getIsSorted() === 'asc'}
                    🔼
                  {:else if header.column.getIsSorted() === 'desc'}
                    🔽
                  {/if}
                {/if}
              </th>
            {/each}
          </tr>
        {/each}
      </thead>
      <tbody>
        {#each table.getRowModel().rows as row (row.id)}
          <tr>
            {#each row.getAllCells() as cell (cell.id)}
              <td>
                <FlexRender {cell} />
              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}

<style>
  .table-wrapper {
    overflow-x: auto;
    margin-top: 1rem;
  }

  table {
    border-collapse: collapse;
    width: 100%;
    font-size: 0.9rem;
  }

  th,
  td {
    border: 1px solid #e2e2e2;
    padding: 0.5rem 0.75rem;
    text-align: left;
    vertical-align: middle;
  }

  thead th {
    background: #f7f7f8;
    font-weight: 600;
  }

  tbody tr:nth-child(even) {
    background: #fafafa;
  }

  tbody tr:hover {
    background: #f0f4ff;
  }

  .sortable {
    cursor: pointer;
    user-select: none;
  }
</style>