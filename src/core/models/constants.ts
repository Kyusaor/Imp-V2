export abstract class Constants {

    static readonly kyu = "370293090407153665"
    static readonly ImpServerId = "681643180587876367"
    static readonly botId = "533662476215255041"

    static readonly channelsId = {
        VALIDATION_CHANNEL: "1073252249926631425",
        R4_CHECKOUT: "802883413806940172",
        ERRORS_LOGS: "1076152712384745492",
        AUTO_ROLE: "808743465395421204",
        ANNUAIRE_LIST: "801329985113030687"
    }

    static readonly rolesId = {
        R4: "681645771678154752",
        newMember: {
            imp: [
                '735839625796517888', //Imp member
                '801335272998436874', //T4 SN
                '801336382735515678', //Rally war
                '801336531737640961', //Def war
                '801337278789451776', //Solo war
            ],
            zak: [
                '1076901335066230795',//zak member
                '801336531737640961', //Def war
            ],
            guest: [
                '801339397362024478'
            ],
        },
        autorole: {
            def: "801336531737640961",
            rally: "801336382735515678",
            sn: "801335272998436874",
            solo: "801337278789451776",
        }
    }

    static readonly text = {
        console: {
            READY: " connecté"
        },
        newMember: {
            askNickname: "Les r4 ont été prévenu, ils vont bientôt vous donner l'accès au reste du serveur\n\nEn attendant, dites-moi: avez-vous le même pseudo sur Discord et sur Lords mobile?",
            cancelNickname: "Les r4 ont été prévenu, ils vont bientôt vous donner l'accès au reste du serveur",
            endNickname: "Ça marche ! Vous aurez bientôt accès au serveur",
        },
        contacts: {
            askToReplace: "Voulez-vous remplacer la fiche contact de ",
            memberNotFound: "Ce membre est introuvable",
        },
        errors: {
            errorCommand: "Un problème s'est produit dans l'exécution de la commande",
            errorFetchMember: "Le membre est introuvable",
            memberAlreadyTreated: "Le membre a déjà eu l'attribution des rôles",
            memberEmbedFieldsUnavailable: "Les champs sont introuvables",
            unavailableCommand: "Module de commande indisponible",
        },
        commands: {
            annuaireListSuccess: "L'annuaire a bien été envoyé",
            autoroleSuccess: "Le panneau d'autorole a bien été défini",
            autoroleNoProvidedRoles: "Aucun nouveau rôle n'a été donné, vos rôles sont donc restés tels quels",
            cancelledCommand: "Commande annulée",
        }
    }

    static readonly images = {
        autoroleThumbnail: "https://media.discordapp.net/attachments/448805104615686145/776568612315463710/PicsArt_11-12-11.06.12.png"
    }
}