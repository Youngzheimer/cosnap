<script lang="ts">
    import { enhance } from "$app/forms";
    import type { ActionData } from './$types';

    let { form }: { form: ActionData } = $props();

    let timezone = new Date().getTimezoneOffset();

    type FormSchemaForMakingOne = FormSchema & {
        id: string; 
        required: boolean;
    };

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

    function deleteField(e: Event) {
        
    }
</script>

{#if !form?.success}
    <p class="alert error" role="alert">{form?.message}</p>
{/if}

<p>
    {JSON.stringify(formSchema, null, 2)}
</p>

<form method="POST" use:enhance>
    <input type="hidden" name="formSchema" value={JSON.stringify(formSchema)}>
    <input type="hidden" name="timezone" value={timezone}>

    <select onchange={addField} bind:value={selectedValue}>
        <option value="" disabled selected>필드 유형 선택</option>
        <option value="bool">체크박스</option>
        <option value="shorttext">짧은 텍스트</option>
        <option value="longtext">긴 텍스트</option>
    </select>

    <label for="name">이벤트 이름</label>
    <input type="text" id="name" name="name" required />

    <label for="description">이벤트 설명</label>
    <input type="text" id="description" name="description" required />

    {#each formSchema as field (field.id)}
        <div style="border: 1px solid #ccc; padding: 10px; margin-bottom: 10px;">
            <label>필드 제목</label>
            <input type="text" bind:value={field.title}>

            <label>필드 설명</label>
            <input type="text" bind:value={field.description}>

            <label>
            <input type="checkbox" bind:checked={field.required}> 필수 여부

            {#if field.formType === "bool"}
                <input type="checkbox" bind:checked={field.default as boolean}> 
            {:else if field.formType === "shorttext"}
                <input type="text" placeholder="플레이스홀더 입력" bind:value={field.placeholder}>
                <input type="text" placeholder="기본값 입력" bind:value={field.default}>
            {:else if field.formType === "longtext"}
                <input type="text" placeholder="플레이스홀더 입력" bind:value={field.placeholder}>
                <textarea placeholder="기본값 입력" bind:value={field.default}></textarea>
            {/if}

            <button onclick={deleteField}>필드 삭제</button>
        </div>
        <hr>
    {/each}

    <label for="submitExpiry">제출 마감일</label>
    <input type="datetime-local" id="submitExpiry" name="submitExpiry" required />

    <button type="submit">이벤트 생성</button>
</form>