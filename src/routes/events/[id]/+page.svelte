<script lang="ts">
    import { resolve } from '$app/paths';
    import type { PageData } from './$types';
    let { data }: { data: PageData } = $props();
</script>

{#if !data.event}
    <p>Event not found. Return to <a href="{resolve('/events')}">events list</a>.</p>
{:else}
    <h1>{data.event.name}</h1>
    {#each data.cards as card (card.ID)}
        <div class="card">
            <h2>{card.index}</h2>
            <p>submitted: {card.submitted}</p>
            <p>id: {card.ID}</p>
            <p>data: {card.data}</p>
        </div>
    {/each}
{/if}