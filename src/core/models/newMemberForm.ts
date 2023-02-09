import { GuildMember} from "discord.js";

export class MemberIncome {

    member: GuildMember;

    constructor (member: GuildMember) {
        this.member = member;
    }

}