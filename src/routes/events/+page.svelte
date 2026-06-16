<script lang="ts">
    import { resolve } from '$app/paths';
    import type { PageData } from './$types';;
    let { data }: { data: PageData } = $props();


</script>

<a href="{resolve('/events/makeone')}" class="button">Create Event</a>

{#if data.events.length === 0}
    <p>No events found. Create one?</p>
{:else}
    <ul>
        {#each data.events as event (event.ID)}
            <li> <a href="{resolve(`/events/${event.ID}`)}" class="event-card">
                    <h3>{event.name}</h3>
                </a>
            </li>
        {/each}
    </ul>
{/if}