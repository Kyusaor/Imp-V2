import { GuildMember, TextChannel } from "discord.js";
import { bot } from "../../main.js";
import { Constants } from "./constants.js";
import { Methods } from "./methods.js";

export class MemberIncome {

    private _member: GuildMember;
    private _nickname: string | undefined;
    private _guild: "imp" | "invited"


    constructor(member: GuildMember, nick: string | undefined, guild: "imp" | "invited") {
        this._member = member;
        this._nickname = nick;
        this._guild = guild;
    }

    async createModal(member: GuildMember) {
        let validChannel = await bot.channels.fetch(Constants.channelsId.VALIDATION_CHANNEL) as TextChannel;
        if(!validChannel) throw "No valid channel found (MemberIncomecreateModal)";

        let payload = await Methods.constructIncomeModal(member);
    }
}