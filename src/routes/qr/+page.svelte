<script lang="ts">
    import type { PageData } from './$types';
    let { data }: { data: PageData } = $props();
    let eventSchema = JSON.parse(data.event?.schema ?? '{}');
</script>

{#if data.error}
    <p>{data.error}</p>
{:else}
    <h1>{data.event?.name}</h1>
    <img src={data.auth?.pfp} alt="Auth pfp" />
    <p>{data.auth?.name}</p>
    <p>Card ID: {data.card?.ID}</p>
    <p>Event ID: {data.event?.ID}</p>

    <!-- form -->
    {#each Object.keys(eventSchema.properties ?? {}) as prop (prop)}
        {#if eventSchema.properties[prop].title}
            <h3>{eventSchema.properties[prop].title}</h3>
        {/if}
        {#if eventSchema.properties[prop].description}
            <p>{eventSchema.properties[prop].description}</p>
        {/if}

        <!-- data input -->

        {#if eventSchema.properties[prop].formType === 'shorttext'}
            <input type="text" placeholder={eventSchema.properties[prop].placeholder ?? ''} />
        {:else if eventSchema.properties[prop].formType === 'longtext'}
            <textarea placeholder={eventSchema.properties[prop].placeholder ?? ''}></textarea>
        {:else if eventSchema.properties[prop].formType === 'bool'}
            <input type="checkbox" />
        {/if}

        <hr />
    {/each}
{/if}