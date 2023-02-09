import { GuildMember } from "discord.js";
import { bot } from "../../main.js";
import { Constants } from "./constants.js";

export class MemberIncome {

    member: GuildMember;
    nickname: string | undefined;
    guild: "imp" | "invited"


    constructor(member: GuildMember, nick: string | undefined, guild: "imp" | "invited") {
        this.member = member;
        this.nickname = nick;
        this.guild = guild;
    }

}