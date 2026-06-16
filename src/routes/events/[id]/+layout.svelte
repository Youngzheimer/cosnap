<script lang="ts">
    import { page } from '$app/state';
    import { resolve } from '$app/paths';
    import type { LayoutData } from './$types';
    
    let { data, children }: { data: LayoutData, children: any } = $props();

    let eventId = $derived(page.params.id);
</script>

<a href="{resolve('/events')}">← Back to Events List</a>

{#if !data.event}
    <p>Event not found. Return to <a href="{resolve('/events')}">events list</a>.</p>
{/if}

<div>
    <h1>{data.event.name}</h1>
    <p>{data.event.schema}</p>

</div>

<nav class="tabs">
    <a href={resolve(`/events/${eventId}`)} class="tab-btn">이벤트 홈</a>

    <a href={resolve(`/events/${eventId}/cards`)} class="tab-btn">카드 관리</a>

    <a href={resolve(`/events/${eventId}/settings`)} class="tab-btn">이벤트 설정</a>
</nav>

<hr />

{@render children()}
