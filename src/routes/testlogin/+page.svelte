<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';

	// Svelte 5: $props() 룬을 사용하여 data와 form을 구조 분해 할당으로 가져옵니다.
	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<main class="container">
	<h2>테스트 로그인</h2>
	<p>로그인할 테스트 계정을 선택하세요.</p>

	{#if form?.error}
		<div class="alert error">{form.error}</div>
	{/if}

	{#if form?.success}
		<div class="alert success">로그인에 성공했습니다!</div>
	{/if}

	<div class="user-list">
		{#each data.allAuths as user (user.ID)}
			<div class="user-card">
				<div class="avatar">
					{#if user.pfp}
						<img src={user.pfp} alt="{user.name} profile" />
					{:else}
						<div class="placeholder">👤</div>
					{/if}
				</div>

				<div class="user-info">
					<strong>{user.name}</strong>
					<span>ID: {user.ID}</span>
				</div>

				<form method="POST" use:enhance>
					<input type="hidden" name="ID" value={user.ID} />
					<button type="submit">이 계정으로 로그인</button>
				</form>
			</div>
		{:else}
			<p>등록된 테스트 계정이 없습니다.</p>
		{/each}
	</div>
</main>

<style>
	.container {
		max-width: 600px;
		margin: 2rem auto;
		font-family: sans-serif;
	}

	.alert {
		padding: 1rem;
		margin-bottom: 1rem;
		border-radius: 4px;
		font-weight: bold;
	}
	.alert.error {
		background-color: #fee2e2;
		color: #991b1b;
	}
	.alert.success {
		background-color: #dcfce7;
		color: #166534;
	}

	.user-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.user-card {
		display: flex;
		align-items: center;
		padding: 1rem;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		background-color: #f9fafb;
	}

	.avatar {
		width: 50px;
		height: 50px;
		border-radius: 50%;
		overflow: hidden;
		margin-right: 1rem;
		background-color: #e5e7eb;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.placeholder {
		font-size: 1.5rem;
	}

	.user-info {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.user-info strong {
		font-size: 1.1rem;
		color: #111827;
	}

	.user-info span {
		font-size: 0.9rem;
		color: #6b7280;
	}

	button {
		padding: 0.5rem 1rem;
		background-color: #3b82f6;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-weight: bold;
		transition: background-color 0.2s;
	}

	button:hover {
		background-color: #2563eb;
	}
</style>