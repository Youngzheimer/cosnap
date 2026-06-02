import { db } from "$lib/server/db/index";
import { cards, auths, events } from "$lib/server/db/schema";
import { v4 as uuidv4 } from "uuid";

export function resetDevValue() {
    db.delete(cards).execute();
    db.delete(auths).execute();
    db.delete(events).execute();

    const authID = uuidv4();
    const eventID = uuidv4();

    db.insert(auths).values({
        "ID": authID,
        "name": "John Pork",
        "pfp": "https://i.pravatar.cc/300?img=1",
        "info": JSON.stringify({
            "twitter": "@johnpork",
            "instagram": "@johnpork",
        })
    }).execute();

    db.insert(events).values({
        "ID": eventID,
        "authID": authID,
        "name": "서울코믹월드 Summer 2077",
        "schema": JSON.stringify({
            "title": "서울코믹월드 Summer 2077",
            "description": "Thanks for shooting with me!\nPlease fill out the form below to submit your card.",
            "type": "object",
            "properties": {
                "character": {
                    "title": "캐릭터",
                    "description": "코스프레하신 캐릭터명을 입력해주세요.",
                    "placeholder": "트릭컬 - 마카샤",
                    "type": "string",
                    "default": ""
                },
                "SNSupload": {
                    "title": "SNS 업로드 여부",
                    "description": "트위터 등 SNS에 업로드가 가능한지 선택해주세요.",
                    "type": "boolean",
                    "default": false
                },
                "dontRevealFace": {
                    "title": "얼굴 모자이크 여부",
                    "description": "공개 시 얼굴에 모자이크 처리가 되는 것을 원하시면 선택해주세요.",
                    "type": "boolean",
                    "default": false
                },
                "SNS": {
                    "title": "SNS 계정",
                    "description": "사진을 보내드릴 SNS 계정을 입력해주세요.",
                    "placeholder": "@johnpork",
                    "type": "string",
                    "default": ""
                },
                "feedback": {
                    "title": "피드백",
                    "description": "촬영에 대한 피드백이 있으시면 자유롭게 작성해주세요.",
                    "type": "string",
                    "default": ""
                },
                "other": {
                    "description": "그 외에 남기고 싶은 말이 있으시면 자유롭게 작성해주세요.",
                    "type": "string",
                    "default": ""
                }
            },
            "required": ["SNSupload", "dontRevealFace", "SNS"]
        }),
        "submitExpiry": Date.now() + 1000 * 60 * 60 * 24 * 7 // 1 week from now
    }).execute();

    db.insert(cards).values({
        "ID": uuidv4(),
        "authID": authID,
        "eventID": eventID,
        "index": 0,
        "submitted": false
    }).execute();

    console.log("Dev value reset");
    console.log("Auth ID:", authID);
    console.log("Event ID:", eventID);
}
