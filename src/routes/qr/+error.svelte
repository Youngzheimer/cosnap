<script lang="ts">
	import { page } from '$app/state';

    console.log(page);

    let editmessageVisible = $state(false);

    function handleEditClick() {
        editmessageVisible = !editmessageVisible;
    }
</script>

{#if page.error?.message === "Card already submitted"}
    <!-- TODO: 팝업이든 메시지든 띄워서 DM으로 보내든 하라고 얘기 -->
    <p class="center">제출해주셔서 감사합니다. <a onclick={handleEditClick}>수정이 필요하신가요?</a></p>
    <p class="center" style:display={editmessageVisible ? 'block' : 'none'}>보안을 위해 제출 후에는 수정이 불가능합니다.<br/>수정이 필요하신 경우, <a href="https://open.kakao.com/me/fczru">여기</a>로 문의해주세요.</p>
{:else if page.error?.message === "Card not found"}
    <p>카드없다</p>
{:else}
    <p>알 수 없는 오류가 발생했습니다.</p>
{/if}

<style>
    .center {
        text-align: center;
        margin-top: 2rem;
    }

    a {
        color: #222222;
        text-decoration: underline;
        cursor: pointer;
    }
</style>