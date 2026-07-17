<script lang="ts">
    import { resolve } from '$app/paths';
    import type { PageData } from './$types';;
    let { data }: { data: PageData } = $props();

</script>
<div class="event-page">
    <div class="event-header">
        <h1>이벤트 목록</h1>
        <div class="event-button-group">
            <a href="{resolve('/events/makeone')}" class="button">이벤트 생성</a>
        </div>
    </div>
    <div class="event-list">
        {#if data.events.length === 0}
        <div class="no-events">
            <p>이벤트가 없습니다.</p>
        </div>
        {:else}
            {#each data.events as event (event.ID)}
                <a href="{resolve(`/events/${event.ID}`)}" class="event-card">
                <div class="event-card-left">
                    <h3>{event.name}</h3>
                    {JSON.parse(event.schema).description}
                </div>
                <div class="event-card-right">
                    {new Date(event.createdAt).toLocaleDateString()}
                </div>
                </a>
            {/each}
        {/if}
    </div>
</div>  