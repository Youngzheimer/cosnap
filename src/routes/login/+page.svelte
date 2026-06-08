<script lang="ts">
    import { enhance } from '$app/forms';
    import type { ActionData } from './$types';
    let { form }: { form: ActionData } = $props(); 
</script>

{#if form?.error}
    <p style="color: red">{form.error}</p>
{/if}

{#if form?.success}
    <p style="color: green">{form.success}</p>
{/if}

<form method="POST" use:enhance>
    <label for="displayID">Display ID:</label>
    <input type="text" id="displayID" name="displayID" required>

    <label for="password">Password:</label>
    <input type="password" id="password" name="password" required>

    <button type="submit">Log In</button>
</form>