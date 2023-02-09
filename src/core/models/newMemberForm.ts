import { Guild, GuildMember, Snowflake } from "discord.js";

export class MemberIncome {

    member: GuildMember;

    constructor (member: GuildMember) {
        this.member = member;
    }

}