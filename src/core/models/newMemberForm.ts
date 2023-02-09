import { GuildMember, TextChannel } from "discord.js";
import { bot } from "../../main.js";
import { Constants } from "./constants.js";
import { Methods } from "./methods.js";

export class MemberIncome {

    member: GuildMember;
    nickname: string | undefined;
    guild: "imp" | "invited"


    constructor(member: GuildMember, nick: string | undefined, guild: "imp" | "invited") {
        this.member = member;
        this.nickname = nick;
        this.guild = guild;
    }

    async createModal(member: GuildMember) {
        let validChannel = await bot.channels.fetch(Constants.channelsId.VALIDATION_CHANNEL) as TextChannel;
        if(!validChannel) throw "No valid channel found (MemberIncomecreateModal)";

        let payload = await Methods.constructModal(member);
    }
}