import type { Actions } from './$types';
import { db } from "$lib/server/db/index";
import { events } from "$lib/server/db/schema";
import { fail } from 'assert/strict';
import { v4 as uuidv4 } from 'uuid';

export const actions: Actions = {
    default: async (event) => {
        // TODO: 스키마 검증후 이벤트 생성
        const user = event.locals.user;
        const formData = await event.request.formData();
        let formSchema = JSON.parse(formData.get('formSchema') as string);
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const submitExpiry = formData.get('submitExpiry') as string;
        const timezone = parseInt(formData.get('timezone') as string, 10);

        if (!user) {
            return fail(401, { message: 'Unauthorized' });
        }

        if (!name || !description || !submitExpiry || isNaN(timezone)) {
            return fail(400, { message: 'Event name, description, submit expiry, and timezone are required' });
        }

        // timezone에 맞게 time 변환
        const localDate = new Date(submitExpiry);
        const submitExpiryDate = new Date(localDate.getTime() - timezone * 60000);

        // formSchema 처리
        if (typeof formSchema === 'string') {
            formSchema = JSON.parse(formSchema);
        }

        console.log('Received formSchema:', formSchema);

        const properties: Record<string, any> = {};
        formSchema.forEach((field: any) => {
            properties[field.id] = {  
                title: field.title,
                type: field.type,
                description: field.description,
                placeholder: field.placeholder,
                formType: field.formType,
                default: field.default
            };
        });

        const schema = {
            'title': name,
            'description': description,
            'type': 'object',
            'properties': properties,
            'required': formSchema.filter((field: any) => field.required).map((field: any) => field.id)
        }

        console.log('Constructed schema:', schema);

        // 데이터 삽입
        try {   
            const eventId = uuidv4(); // 이벤트 ID 생성

            await db.insert(events).values({
                ID: eventId,
                authID: user.id,        
                name,
                schema: JSON.stringify(schema),
                submitExpiry: submitExpiryDate.getTime(),
            });

            return {
                success: true,
                eventId
            };
        } catch (error) {
            console.error('Error creating event:', error);
            return fail(500, { message: 'An error occurred while creating the event' });
        }
    }
}