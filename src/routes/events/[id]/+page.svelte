<script lang="ts">
    import { resolve } from '$app/paths';
    import type { PageData } from './$types';
    let { data }: { data: PageData } = $props();

    const submittedCards = data.cards.filter(card => card.submitted);
</script>

{#if !data.event}
    <p>Event not found. Return to <a href="{resolve('/events')}">events list</a>.</p>
{:else}
    <p>Submitted Cards: {submittedCards.length}/{data.cards.length}</p>

{/if}