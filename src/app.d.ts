// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	
			// 공통으로 들어가는 필드들을 따로 분리
			type BaseFormSchema = {
				placeholder?: string;
				formType: "bool" | "shorttext" | "longtext";
				type: "boolean" | "string";
				default?: boolean | string;
			};
	
			// title만 있거나, description만 있거나, 둘 다 있는 경우를 유니온으로 결합
			type FormSchema = BaseFormSchema & (
				| { title: string; description?: string }       // title 필수
				| { title?: string; description: string }       // description 필수
			);
	namespace App {
		// interface Error {}
		interface Locals {
			user?: {
				id: string;
				role: string;
			};
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
