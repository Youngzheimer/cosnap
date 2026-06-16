<script lang="ts">
    import { enhance } from '$app/forms';
    import { resolve } from '$app/paths';
    import type { PageData } from './$types';
    let { data }: { data: PageData } = $props();
</script>

{#if !data.event}
    <p>Event not found. Return to <a href="{resolve('/events')}">events list</a>.</p>
{:else}
    <form method="post" use:enhance>
        <label for="cardNum">몇개:</label>
        <input type="text" id="cardNum" name="cardNum" />
        <button type="submit">Add Card</button>
    </form>

    {#each data.cards as card (card.ID)}
        <div class="card">
            <h2>{card.index}</h2>
            <p>submitted: {card.submitted}</p>
            <p>id: {card.ID}</p>
            <p>data: {card.data}</p>
        </div>
    {/each}
{/if}