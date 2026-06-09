<script lang="ts">
    import { enhance } from '$app/forms';
    import { resolve } from '$app/paths';
    import type { ActionData } from './$types';

    let { form }: { form: ActionData } = $props();
</script>

<main class="auth-page">
    <section class="auth-card" aria-labelledby="signup-title">
        <h1 class="auth-title" id="signup-title">회원가입</h1>

        {#if form?.error}
            <p class="alert error" role="alert">{form.error}</p>
        {/if}

        <!-- {#if form?.success}
            <p class="alert success" role="status">{form.success}</p>
        {/if} -->

        <form method="POST" use:enhance class="auth-form">
            <div class="form-row">
                <label for="displayID">아이디</label>
                <input
                    class="input"
                    type="text"
                    id="displayID"
                    name="displayID"
                    required
                    autocomplete="username"
                    placeholder="예: studio_haneul"
                />
            </div>

            <div class="form-row">
                <label for="password">비밀번호</label>
                <input
                    class="input"
                    type="password"
                    id="password"
                    name="password"
                    required
                    autocomplete="new-password"
                />
            </div>

            <div class="form-row">
                <label for="name">닉네임</label>
                <input class="input" type="text" id="name" name="name" required autocomplete="name" />
            </div>

            <button class="button" type="submit">회원가입</button>
        </form>

        <p class="auth-footer">
            이미 계정이 있나요? <a href={resolve('/login')}>로그인</a>
        </p>
    </section>
</main>