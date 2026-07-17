import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { db } from "$lib/server/db/index";
import { events } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

export const actions: Actions = {
    update: async (event) => {
        const user = event.locals.user;
        const eventId = event.params.id;

        if (!user) {
            return fail(401, { success: false, message: 'Unauthorized' });
        }

        if (!eventId) {
            return fail(400, { success: false, message: "Event ID is required" });
        }

        // 1. 기존 이벤트 조회 및 권한 체크
        const [eventData] = await db.select().from(events).where(eq(events.ID, eventId));
        
        if (!eventData) {
            return fail(404, { success: false, message: "Event not found" });
        }

        if (eventData.authID !== user.id) {
            return fail(403, { success: false, message: "Unauthorized access to this event" });
        }

        const formData = await event.request.formData();
        
        // --- 추가된 마스터 정보 추출 ---
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const submitExpiry = formData.get('submitExpiry') as string;
        const timezone = parseInt(formData.get('timezone') as string, 10);
        const formSchemaRaw = formData.get('formSchema');

        // 유효성 검증
        if (!name || !description || !submitExpiry || isNaN(timezone)) {
            return fail(400, { success: false, message: '이벤트 이름, 설명, 마감일, 타임존은 필수 항목입니다.' });
        }

        if (!formSchemaRaw || typeof formSchemaRaw !== 'string') {
            return fail(400, { success: false, message: "Invalid form schema" });
        }

        try {
            // timezone에 맞게 마감일 Time 변환
            const localDate = new Date(submitExpiry);
            const submitExpiryDate = new Date(localDate.getTime() - timezone * 60000);

            const formSchema = JSON.parse(formSchemaRaw);

            // properties 구조 재조립
            const properties: Record<string, any> = {};
            formSchema.forEach((field: any) => {
                properties[field.id] = {  
                    title: field.title as string,
                    description: field.description as string,
                    type: field.type as string,
                    placeholder: field.placeholder as string,
                    formType: field.formType as string,
                    default: field.default as string | boolean,
                };
            });

            // schema 구조 생성 (새로 입력받은 name과 description 반영)
            const reconstructedSchema = {
                'title': name,
                'description': description,
                'type': 'object',
                'properties': properties,
                'required': formSchema.filter((field: any) => field.required).map((field: any) => field.id)
            };

            // 2. DB 업데이트 실행 (events 테이블 컬럼들도 함께 업데이트)
            await db.update(events)
                .set({ 
                    name: name,
                    schema: JSON.stringify(reconstructedSchema),
                    submitExpiry: submitExpiryDate.getTime()
                })
                .where(eq(events.ID, eventId));

            return { 
                success: true, 
                message: "이벤트 설정 및 필드가 성공적으로 수정되었습니다." 
            };

        } catch (error) {
            console.error('Error updating event:', error);
            return fail(500, { 
                success: false, 
                message: 'Failed to update event settings' 
            });
        }
    },

    delete: async (event) => {
        // ... 기존 delete 로직 동일 ...
        const user = event.locals.user;
        const eventId = event.params.id;
        if (!user) return fail(401, { message: 'Unauthorized' });
        if (!eventId) return fail(400, { message: "Event ID is required" });
        const [eventData] = await db.select().from(events).where(eq(events.ID, eventId));
        if (!eventData) return fail(404, { message: "Event not found" });
        if (eventData.authID !== user.id) return fail(403, { message: "Unauthorized access" });
        await db.delete(events).where(eq(events.ID, eventId));
        throw redirect(303, '/events');
    }
};