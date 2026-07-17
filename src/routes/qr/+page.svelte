<script lang="ts">
    import type { ActionData, PageData } from './$types';
    import { enhance } from '$app/forms';
    
    let { data, form }: { data: PageData, form: ActionData } = $props();
    let eventSchema = JSON.parse(data.event?.schema ?? '{}');
</script>

<div class="submit-page">
    <div class="submit-container">
        <header class="submit-header">
            <h1 class="form-title">{eventSchema.title ?? 'Form Title'}</h1>
            
            <div class="form-meta">
                <div class="form-description">
                    <p>{eventSchema.description ?? 'Form description goes here.'}</p>
                </div>
                <div class="photographer-info">
                    <img src={data.auth?.pfp} alt="Photographer Profile" class="pfp" />
                    <div class="info-text">
                        <span class="name">{data.auth?.name ?? 'Unknown'}</span>
                    </div>
                </div>
            </div>
        </header>

        <form method="POST" use:enhance class="submit-form">
            <input type="hidden" name="cardID" value={data.card?.ID} />
            <input type="hidden" name="eventID" value={data.event?.ID} />

            <div class="field-list">
                {#each Object.keys(eventSchema.properties ?? {}) as prop (prop)}
                    <div class="form-field">
                        <div class="field-header">
                            {#if eventSchema.properties[prop].title}
                                <h3>{eventSchema.properties[prop].title}</h3>
                            {/if}
                            {#if eventSchema.properties[prop].description}
                                <p>{eventSchema.properties[prop].description}</p>
                            {/if}
                        </div>

                        <div class="field-input">
                            {#if eventSchema.properties[prop].formType === 'shorttext'}
                                <input 
                                    type="text" 
                                    class="input"
                                    name={prop} 
                                    placeholder={eventSchema.properties[prop].placeholder ?? ''} 
                                    value={eventSchema.properties[prop].default ?? ''} 
                                />
                            {:else if eventSchema.properties[prop].formType === 'longtext'}
                                <textarea 
                                    class="input textarea"
                                    name={prop} 
                                    placeholder={eventSchema.properties[prop].placeholder ?? ''}
                                >{eventSchema.properties[prop].default ?? ''}</textarea>
                            {:else if eventSchema.properties[prop].formType === 'bool'}
                                <label class="ox-toggle">
                                    <input 
                                        type="checkbox" 
                                        name={prop} 
                                        checked={eventSchema.properties[prop].default === true || eventSchema.properties[prop].default === "true"} 
                                    />
                                    <div class="ox-slider">
                                        <div class="slider-bg"></div>
                                        <span class="text-o">O</span>
                                        <span class="text-x">X</span>
                                    </div>
                                </label>
                            {/if}
                        </div>
                    </div>
                {/each}
            </div>

            <button type="submit" class="button submit-btn">제출</button>
        </form>

        {#if form?.error}
            <div class="alert error">
                ❌ {form.error}
            </div>
        {/if}

        {#if form?.success}
            <div class="alert success">
                🎉 {form.success}
            </div>
        {/if}
    </div>
</div>