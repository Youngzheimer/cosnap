<script lang="ts">
    import { enhance } from '$app/forms';
    import { resolve } from '$app/paths';
    import { page } from '$app/stores';
    import type { ActionData } from './$types';
    import { getFlash } from 'sveltekit-flash-message';

    let { form }: { form: ActionData } = $props();

    const flash = getFlash(page);
</script>

<main class="auth-page">
    <section class="auth-card" aria-labelledby="login-title">

        <h1 class="auth-title" id="login-title">로그인</h1>

        {#if form?.error}
            <p class="alert error" role="alert">{form.error}</p>
        {/if}

        {#if $flash}
            <p class="alert success" role="status">{$flash.message}</p>
        {/if}

        <!-- {#if form?.success}
            <p class="alert success" role="status">{form.success}</p>
        {/if} -->

        <form method="POST" use:enhance class="auth-form">
            <div class="form-row">
                <label for="displayID">아이디</label>
                <input class="input" type="text" id="displayID" name="displayID" required autocomplete="username" />
            </div>

            <div class="form-row">
                <label for="password">비밀번호</label>
                <input
                    class="input"
                    type="password"
                    id="password"
                    name="password"
                    required
                    autocomplete="current-password"
                />
            </div>

            <button class="button" type="submit">로그인</button>
        </form>

        <p class="auth-footer">
            아직 계정이 없나요? <a href={resolve('/signup')}>회원가입</a>
        </p>
    </section>
</main>