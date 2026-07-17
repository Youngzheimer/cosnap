<script lang="ts">
    let {
        field = $bindable(),
        onDelete,
        onMoveUp,
        onMoveDown,
        isFirst,
        isLast
    }: {
        field: FormSchemaForMakingOne;
        onDelete: () => void;
        onMoveUp: () => void;
        onMoveDown: () => void;
        isFirst: boolean;
        isLast: boolean;
    } = $props();
</script>

<div class="createvent-field">
    <div class="field-header">
        <div class="field-header-left">
            <input type="text" bind:value={field.title} class="form-title {field.formType === 'bool' ? 'bool' : ''}" placeholder="필드 제목...">
            <input type="text" bind:value={field.description} class="form-description" placeholder="필드 설명...">
        </div>
        <div class="field-header-right">
            
            <div class="move-buttons-wrapper">
                <button 
                    type="button" 
                    class="button move move-up" 
                    onclick={onMoveUp} 
                    disabled={isFirst}
                >
                    ▲
                </button>
                <button 
                    type="button" 
                    class="button move move-down" 
                    onclick={onMoveDown} 
                    disabled={isLast}
                >
                    ▼
                </button>
            </div>

            <button type="button" onclick={onDelete} class="button delete">필드 삭제</button>
            <button 
                type="button" 
                class="{field.required ? 'on' : 'off'} button"
                onclick={() => field.required = !field.required}
            >
                {field.required ? '필수 ON' : '필수 OFF'}
            </button>
            {#if field.formType === "bool"}
                <button type="button" class="{field.default ? 'on' : 'off'} button" onclick={() => field.default = !field.default}>
                    {field.default ? '기본값 ON' : '기본값 OFF'}
                </button>
            {/if}
        </div>
    </div>
    
        {#if field.formType === "shorttext"}
        <div class="field-body">
            <input type="text" placeholder="플레이스홀더 입력" bind:value={field.placeholder} class="shorttext-placeholder">
            <input type="text" placeholder="기본값 입력" bind:value={field.default} class="shorttext-default">
        </div>
    {:else if field.formType === "longtext"}
        <div class="field-body">
            <input type="text" placeholder="플레이스홀더 입력" bind:value={field.placeholder} class="longtext-placeholder">
            <textarea placeholder="기본값 입력" bind:value={field.default} class="longtext-default"></textarea>
        </div>
    {/if}
</div>