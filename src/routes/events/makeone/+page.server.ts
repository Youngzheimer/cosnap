import type { Actions } from './$types';
import { db } from "$lib/server/db/index";
import { redirect, isRedirect } from '@sveltejs/kit';
import { events } from "$lib/server/db/schema";
import { fail } from 'assert/strict';
import { v4 as uuidv4 } from 'uuid';

export const actions: Actions = {
    default: async (event) => {
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

        type EventSchema = {
            title: string;
            description: string;
            type: string;
            placeholder: string;
            formType: string;
            default: string | boolean;
        };

        type FormSchemaForMakingOne = FormSchema & {
            id: string; 
            required: boolean;
        }; 

        const properties: Record<string, EventSchema> = {};
        formSchema.forEach((field: FormSchemaForMakingOne) => {
            properties[field.id] = {  
                title: field.title as string,
                description: field.description as string,
                type: field.type as string,
                placeholder: field.placeholder as string,
                formType: field.formType as string,
                default: field.default as string | boolean,
            };
        });

        const schema = {
            'title': name,
            'description': description,
            'type': 'object',
            'properties': properties,
            'required': formSchema.filter((field: FormSchemaForMakingOne) => field.required).map((field: FormSchemaForMakingOne) => field.id)
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

            throw redirect(303, `/events/${eventId}`);
        } catch (error) {
            if (isRedirect(error)) {
                throw error; // 리디렉션 예외는 그대로 던집니다.
            }

            console.error('Error creating event:', error);
            return {
                success: false,
                message: 'Failed to create event'
            }
        }
    }
}