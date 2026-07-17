<script lang="ts">
    import { enhance } from '$app/forms';
    import type { PageData, ActionData } from './$types';
    import FieldEditor from '$lib/components/FieldEditor.svelte'; 

    let { data, form }: { data: PageData, form: ActionData } = $props();

    // 타임존 설정
    let timezone = new Date().getTimezoneOffset();

    // --- [추가] DB에 저장된 밀리초(ms) 타임스탬프를 datetime-local input 포맷으로 변환하는 함수 ---
    function formatTimestampToDateTimeLocal(timestamp: number, offsetMinutes: number): string {
        if (!timestamp) return "";
        // 서버에 저장될 때 offset만큼 차감되었으므로, 다시 더해서 로컬 시간으로 복원
        const localDate = new Date(timestamp + offsetMinutes * 60000);
        
        const pad = (n: number) => n.toString().padStart(2, '0');
        const yyyy = localDate.getFullYear();
        const mm = pad(localDate.getMonth() + 1);
        const dd = pad(localDate.getDate());
        const hh = pad(localDate.getHours());
        const min = pad(localDate.getMinutes());
        
        return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
    }

    // --- DB 데이터를 기반으로 상단 마스터 필드 및 스키마 정보 파싱 ---
    const dbSchema = typeof data.event.schema === 'string' 
        ? JSON.parse(data.event.schema || '{}') 
        : (data.event.schema || {});

    // 상단 폼 필드 상태 정의
    let eventName = $state(data.event.name || "");
    let eventDescription = $state(dbSchema.description || "");
    let submitExpiryStr = $state(formatTimestampToDateTimeLocal(data.event.submitExpiry, timezone));

    // 하단 필드 리스트 역파싱
    let initialSchema: FormSchemaForMakingOne[] = $derived.by(() => {
        if (!dbSchema.properties) return [];

        return Object.entries(dbSchema.properties).map(([id, field]: [string, any]) => {
            return {
                id,
                formType: field.formType,
                type: field.type,
                title: field.title,
                description: field.description,
                placeholder: field.placeholder,
                default: field.default,
                required: Array.isArray(dbSchema.required) ? dbSchema.required.includes(id) : false
            };
        });
    });

    let formSchema: FormSchemaForMakingOne[] = $state([]);
    
    $effect(() => {
        if (initialSchema.length > 0 && formSchema.length === 0) {
            formSchema = initialSchema;
        }
    });

    let selectedValue = $state("");

    function addField() {
        if (!selectedValue) return;

        const additionalField: FormSchemaForMakingOne = {
            formType: selectedValue as 'bool' | 'shorttext' | 'longtext',
            type: selectedValue === "bool" ? "boolean" : "string",
            title: "",
            description: "",
            placeholder: "",
            default: selectedValue === "bool" ? false : "",
            required: false,
            id: crypto.randomUUID()
        };

        formSchema = [...formSchema, additionalField];
        selectedValue = "";
    }

    function deleteField(idToDelete: string) {
        formSchema = formSchema.filter(field => field.id !== idToDelete);
    }

    function moveField(index: number, direction: 'up' | 'down') {
        const newSchema = [...formSchema]; 
        if (direction === 'up' && index > 0) {
            [newSchema[index - 1], newSchema[index]] = [newSchema[index], newSchema[index - 1]];
        } else if (direction === 'down' && index < newSchema.length - 1) {
            [newSchema[index + 1], newSchema[index]] = [newSchema[index], newSchema[index + 1]];
        }
        formSchema = newSchema;
    }
</script>

<h2>이벤트 설정 수정</h2>

{#if form?.message}
    <p class="alert {form.success ? 'success' : 'error'}">{form.message}</p>
{/if}

<form method="POST" action="?/update" use:enhance>
    <input type="hidden" name="formSchema" value={JSON.stringify(formSchema)}>
    <input type="hidden" name="timezone" value={timezone}>

    <div class="master-settings">
        <div class="input-group">
            <label Bars for="name">이벤트 이름</label>
            <input class="topinput title" autocomplete="off" type="text" id="name" name="name" bind:value={eventName} placeholder="이벤트 이름" required />
        </div>
        
        <div class="input-group">
            <label for="description">폼 설명</label>
            <textarea class="topinput desc" autocomplete="off" id="description" name="description" bind:value={eventDescription} placeholder="폼 설명" required></textarea>
        </div>

        <div class="input-group">
            <label for="submitExpiry">제출 마감일</label>
            <input type="datetime-local" id="submitExpiry" name="submitExpiry" bind:value={submitExpiryStr} required />
        </div>
    </div>

    <hr>
    <h3>폼 필드 구성</h3>

    <div class="field-adder">
        <select onchange={addField} bind:value={selectedValue}>
            <option value="" disabled selected>필드 추가</option>
            <option value="bool">체크박스</option>
            <option value="shorttext">짧은 텍스트</option>
            <option value="longtext">긴 텍스트</option>
        </select>
    </div>  
    
    <div class="field-list">
        {#each formSchema as field, index (field.id)}
            <FieldEditor 
                bind:field={formSchema[index]} 
                onDelete={() => deleteField(field.id)} 
                onMoveUp={() => moveField(index, 'up')}
                onMoveDown={() => moveField(index, 'down')}
                isFirst={index === 0}
                isLast={index === formSchema.length - 1}
            />
            {#if index !== formSchema.length - 1}
                <hr>
            {/if}
        {/each}
    </div>

    <button type="submit" class="save-btn">변경사항 저장</button>
</form>

<hr>

<div class="danger-zone">
    <h3>위험 구역</h3>
    <form method="POST" action="?/delete" use:enhance={({ cancel }) => {
            if (!confirm("정말로 이 이벤트를 삭제하시겠습니까?")) {
                cancel();
            }
        }}
    >
        <button type="submit" class="delete-btn">이벤트 삭제</button>
    </form>
</div>