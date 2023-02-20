export abstract class Constants {

    static readonly kyu = "370293090407153665"
    static readonly ImpServerId = "681643180587876367"
    static readonly botId = "533662476215255041"

    static readonly channelsId = {
        VALIDATION_CHANNEL: "1073252249926631425",
        R4_CHECKOUT: "1076898278219722812",
        ERRORS_LOGS: "1076152712384745492"
    }

    static readonly rolesId = {
        R4: "681645771678154752"
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
        errors: {
            errorCommand: "Un problème s'est produit dans l'exécution de la commande",
        }
    }
}