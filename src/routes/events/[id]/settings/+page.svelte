<script lang="ts">
    import { enhance } from '$app/forms';
</script>

<form method="post" use:enhance={({ submitter, cancel }) => {
        const action = submitter?.getAttribute('formaction');

        if (action?.includes('?/delete')) {
            if (!confirm("정말로 이 이벤트를 삭제하시겠습니까?")) {
                cancel();
            }
        }
    }}
>
    <button type="submit" formaction="?/delete">이벤트 삭제</button>
</form>