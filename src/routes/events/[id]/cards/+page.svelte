<script lang="ts">
  import { enhance } from '$app/forms';
  import { resolve } from '$app/paths';
  import QRCode from '@castlenine/svelte-qrcode';
  import QRCodeLib from 'qrcode'; // PNG 생성을 위한 라이브러리 추가
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

  // --- 추가된 다운로드 로직 ---
  async function downloadAllQRs() {
    if (!flatCards || flatCards.length === 0) {
      alert('다운로드할 QR 코드가 없습니다.');
      return;
    }

    for (const card of flatCards) {
      const url = `${window.location.origin}/qr?id=${card.ID}`;
      
      try {
        // 1. QR 코드를 PNG Data URL 형식으로 생성
        const dataUrl = await QRCodeLib.toDataURL(url, {
          width: 300, // 다운로드될 이미지 사이즈 조정 가능
          margin: 2
        });

        // 2. index 5자리 패딩 + UUID 형식으로 파일명 구성
        const paddedIndex = String(card.index).padStart(5, '0');
        const fileName = `${paddedIndex}_${card.ID}.png`;

        // 3. 가상의 a 태그를 만들어 다운로드 트리거
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // ※ 중요: 브라우저가 다중 다운로드를 스팸으로 인식해 차단하는 것을 막기 위한 약간의 딜레이
        await new Promise(resolve => setTimeout(resolve, 150));
      } catch (error) {
        console.error(`QR 코드 생성 실패 (ID: ${card.ID}):`, error);
      }
    }
  }
</script>

{#if !data.event}
  <p>Event not found. Return to <a href="{resolve('/events')}">events list</a>.</p>
{:else}
  <div class="controls-container">
    <form method="post" use:enhance class="add-form">
      <label for="cardNum">몇개:</label>
      <input type="text" id="cardNum" name="cardNum" />
      <button type="submit">Add Card</button>
    </form>

    <button class="download-btn" onclick={downloadAllQRs}>
      Download ALL QR
    </button>
  </div>

  <div class="table-wrapper">
    <input type="text" placeholder="검색..." bind:value={globalFilter} class="search-input" />
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
  .controls-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .add-form {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .download-btn {
    background-color: #4f46e5;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
    transition: background-color 0.2s;
  }

  .download-btn:hover {
    background-color: #4338ca;
  }

  .search-input {
    margin-bottom: 1rem;
    padding: 0.4rem;
    width: 200px;
  }

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