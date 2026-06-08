<script lang="ts">
    import type { ActionData, PageData } from './$types';
    import { enhance } from '$app/forms';
    let { data, form }: { data: PageData, form: ActionData } = $props();
    let eventSchema = JSON.parse(data.event?.schema ?? '{}');
    console.log(eventSchema);
</script>

<h1>{data.event?.name}</h1>
<img src={data.auth?.pfp} alt="Auth pfp" />
<p>{data.auth?.name}</p>
<p>Card ID: {data.card?.ID}</p>
<p>Event ID: {data.event?.ID}</p>

<form method="POST" use:enhance>
    <input type="hidden" name="cardID" value={data.card?.ID} />

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
            <input type="text" name={prop} placeholder={eventSchema.properties[prop].placeholder ?? ''} value={eventSchema.properties[prop].default ?? ''} />
        {:else if eventSchema.properties[prop].formType === 'longtext'}
            <textarea name={prop} placeholder={eventSchema.properties[prop].placeholder ?? ''}>{eventSchema.properties[prop].default ?? ''}</textarea>
        {:else if eventSchema.properties[prop].formType === 'bool'}
            {#if eventSchema.properties[prop].default === "true"}
                <input type="checkbox" name={prop} checked />
            {:else}
                <input type="checkbox" name={prop} />
            {/if}
        {/if}

        <hr />
    {/each}

    <button type="submit">Submit</button>
</form>

{#if form?.error}
    <p style="color: red; font-weight: bold;">❌ 에러 발생: {form.error}</p>
{/if}

{#if form?.success}
    <p style="color: green; font-weight: bold;">🎉 성공: {form.success}</p>
{/if}