<script lang="ts">
    import { enhance } from "$app/forms";
    import type { ActionData } from './$types';
    
    // 1. 타입과 자식 컴포넌트 import
    import FieldEditor from '$lib/components/FieldEditor.svelte'; 

    let { form }: { form: ActionData } = $props();

    let timezone = new Date().getTimezoneOffset();

    let formSchema: FormSchemaForMakingOne[] = $state([]);
    let selectedValue = $state("");

    function addField() {
        if (!selectedValue) return;

        const additionalField: FormSchemaForMakingOne = {
            // @ts-expect-error: value는 항상 formType에 포함된 놈들만 넣어놔서 괜찮음
            formType: selectedValue,
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
        // 반응성을 확실히 트리거하기 위해 배열 복사
        const newSchema = [...formSchema]; 
        
        if (direction === 'up' && index > 0) {
            // 구조 분해 할당을 이용한 배열 요소 스왑 (위로)
            [newSchema[index - 1], newSchema[index]] = [newSchema[index], newSchema[index - 1]];
        } else if (direction === 'down' && index < newSchema.length - 1) {
            // 구조 분해 할당을 이용한 배열 요소 스왑 (아래로)
            [newSchema[index + 1], newSchema[index]] = [newSchema[index], newSchema[index + 1]];
        }
        
        // 덮어씌워서 Svelte 상태 업데이트
        formSchema = newSchema;
    }
</script>

{#if (form && !form.success)}
    <p class="alert error" role="alert">{form?.message}</p>
{/if}

<div class="createvent-page">
    <h1>이벤트 생성</h1>

    <div class="goback-container">
        <button class="goback" onclick={() => window.history.back()}>
            ← 뒤로가기
        </button>
    </div>

    <form method="POST" use:enhance>
        <input type="hidden" name="formSchema" value={JSON.stringify(formSchema)}>
        <input type="hidden" name="timezone" value={timezone}>

        <input class="topinput title" autocomplete="off" type="text" id="name" name="name" placeholder="이벤트 이름" required />
        <br/>
        
        <input class="topinput desc" autocomplete="off" type="text" id="description" name="description" placeholder="폼 제목" required />
        <br/>

        <textarea class="topinput desc" autocomplete="off" id="description" name="description" placeholder="폼 설명" required></textarea>
        <br/>

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
                
                {#if field.id !== formSchema[formSchema.length - 1].id}
                    <hr>
                {/if}
            {/each}
        </div>

        <label for="submitExpiry">제출 마감일</label>
        <input type="datetime-local" id="submitExpiry" name="submitExpiry" required />

        <button type="submit">이벤트 생성</button>
    </form>
</div>