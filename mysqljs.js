const {
    VK
} = require('vk-io');
const mysql = require('mysql');
const vk = new VK();
var bot = {
    users: {},
    mysql: {
        db: null,
        connect: function() {
                bot.mysql.db = mysql.createPool({
                    host: 'localhost',
                    user: 'root',
                    password: '',
                    database: 'baza',
                    charset: 'utf8mb4_general_ci',
                    connectionLimit: 100
                });
                bot.mysql.db.getConnection(function(err, connection) {
                    if (err) {
                        return console.error(`Ошибка с подключением к бд`, err);
                    } else {
                        bot.mysql.load();
                    }
                    console.log(`К бд подключен`);
                
                });
                },
                load: function() {
                    bot.mysql.db.query('SELECT * FROM `users`', function(err, result) { //загрузка настроек чатов
                        if (err) return console.log('[MYSQL] Ошибка при загрузке аккаунтов!', err);
                        if (!result || !result[0]) return;
                        var time = new Date();
                        for (var i = 0; i < result.length; i++) {
                            bot.users[result[i].uid] = result[i];
                        }
                    });
                },
                }
            }
            bot.mysql.connect();
            vk.setOptions({
                token: 'a5b6846edfe0b1a8d2c9dada0cb2770ad86313548fc39503e969aad97cfde4b5e7493c1b54feb9a07b3f4',
                pollingGroupId: '188502691',
            });
            const {
                updates
            } = vk;
            
            updates.use(async (context, next) => {
                            if (context.type === 'message' && context.isOutbox) {
                                return;
                            }
                            if (!bot.users[context.senderId]) {
                                vk.api.call('users.get', {
                                        user_ids: context.senderId,
                                        fields: 'name,lastname,sex,photo_100'
                                    }).then(res => {
                                            let user = res[0];
                                            bot.users[context.senderId] = {
                                                id: (Object.keys(bot.users).length + 1),
                                                uid: context.senderId,
                                                name: user.first_name,
                                                rassilka: 1,
                                                soobshenie: 1,
                                                adm: 1,
                                                tbonus: 0,
                                                date: getUnix(),
                                                money: 500
                                            };
   bot.mysql.db.query('INSERT IGNORE INTO `users` (`uid`,`name`,`money`, `rassilka`, `soobshenie`, `adm`, `date`) VALUES (?,?,500,1,1,1,?)', [context.senderId, user.first_name, 0])
return context.send(`[id${context.senderId}|${bot.users[context.senderId].name}], вы успешно зарегистрировались! 🎉\nВведите "Помощь", чтобы узнать список команд! 📝`);
}).catch((error) => {
    console.log('err[prefix]');
});
return;
}

try {
    await next();
} catch (error) {
    if (!bot.users[context.senderId]) return;
    else console.error('Error:', error);
}
}); 

updates.hear(/^(?:Eval)\s([^]+)$/i, async (context) => {
    if (context.senderId !== 167888509) return;

    try {
        return context.send("Готово => " + JSON.stringify(eval(context.$match[1])));
    } catch (err) {
        console.log(err);
        return context.send(">Error: " + err);
    }
});

updates.hear(/^(?:all)\s([^]+)$/i, async (context) => {
    if (!bot.users[context.senderId].adm < 2) return;
    for (a in bot.users) {
        if (a.rassilka == 0) return;
        vk.api.messages.send({
            user_id: a.uid,
            chat_id: context.cahtid,
            message: `${context.$match[1]}`
        })
    }
});
updates.hear(/^(?:рассылка выкл)$/i, async (context) => {
    if (bot.users[context.senderId].rassilka = false) return context.send(`Вы отключили рассылку.`)
});

updates.hear(/^(?:репорт)\s([^]+)$/i, async (context) => {
    for (a in bot.users) {
        let f = a.adm == 2;
        vk.api.messages.send({
            user_id: f,
            message: `Репорт от игрока ID${bot.users[context.senderId]}
Сообщение: ${context.$match[1]}
Для ответа используйте ответ id [текст]`
        })
        return context.send(`Вы успешно отправили жалобу.`)
    }
});

updates.hear(/^(?:помощь|💡 Помощь)/i, (context) => {
    return context.send(`${bot.users[context.senderId].name}, мои команды:
Профиль
баланс
`)
});
updates.hear(/^(?:баланс)$/i, async (context) => {
    return context.send(`${bot.users[context.senderId].name}, на руках: ${bot.users[context.senderId].money}$`);
});

updates.hear(/^(?:проф)$/i, async (context) => {
    return context.send(`${bot.users[context.senderId].name},
👤ID: ${bot.users[context.senderId].id}\n💰Баланс: ${bot.users[context.senderId].money}\n🔱Роль: ${bot.users[context.senderId].adm.toString().replace(/1/gi, "Игрок").replace(/2/gi, "Администратор").replace(/3/gi, "Тех.Поддержка").replace(/4/gi, "✅CREATOR BOT✅")}\n⏰Дата регистрации: ${unixStamp(bot.users[context.senderId].date)}
`, {
        keyboard: JSON.stringify({
            "one_time": true,
            "buttons": [
                [{
                        "action": {
                            "type": "text",
                            "payload": "{\"button\": \"1\"}",
                            "label": "⚙ Настройки"
                        },
                        "color": "default"
                    },
                    {
                        "action": {
                            "type": "text",
                            "payload": "{\"button\": \"4\"}",
                            "label": "💡 Помощь "
                        },
                        "color": "negative"
                    }
                ]
            ]
        })
    });
});

updates.hear(/^(?:бонус|💎\sбонус)$/i, async (context) => {
    if (bot.users[context.senderId].tbonus > getUnix()) return context.send(`вы сможете получить бонус через ${unixStampLeft(bot.users[context.senderId].tbonus - Date.now())}`);
    let prize = utils.pick([30000000, 20000000, 1000000, 50000000]);

    getUnix() + 86400000

    return context.send(`вы выиграли ${utils.spaces(prize)}$
💰 На руках: ${utils.spaces(bot.users[context.senderId].money)}$`);
    bot.users[context.senderId].money += prize;

    await message.sendSticker(8797);
});

updates.hear(/^(?:)/i, async (context) => {
    if (!message.IsChat) return;
    if (bot.users[context.senderId].soobshenie == 1) return context.send(`Вы ввели команду неправильно.\nЧтобы отключить это сообщение, напишите: message off`);
});

updates.hear(/^(?:message off)/i, async (context) => {
    if (bot.users[context.senderId].soobshenie = 0) return context.send(`Вы отключили сообщение.`)
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function run() {
    await vk.updates.startPolling();
    console.log(`Включен`);

}

run().catch(console.error);

const utils = {
    sp: (int) => {
        int = int.toString();
        return int.split('').reverse().join('').match(/[0-9]{1,3}/g).join('.').split('').reverse().join('');
    },
    rn: (int, fixed) => {
        if (int === null) return null;
        if (int === 0) return '0';
        fixed = (!fixed || fixed < 0) ? 0 : fixed;
        let b = (int).toPrecision(2).split('e'),
            k = b.length === 1 ? 0 : Math.floor(Math.min(b[1].slice(1), 14) / 3),
            c = k < 1 ? int.toFixed(0 + fixed) : (int / Math.pow(10, k * 3)).toFixed(1 + fixed),
            d = c < 0 ? c : Math.abs(c),
            e = d + ['', ' тыс', ' млн', ' млрд', ' трлн'][k];

        e = e.replace(/e/g, '');
        e = e.replace(/\+/g, '');
        e = e.replace(/Infinity/g, ' Бесконечность');
        e = e.replace(/undefined/g, ' Бесконечность');
        e = e.replace(/NaN/g, ' Бесконечность');
        e = e.replace(/Nan/g, ' Бесконечность');
        e = e.replace(/Null/g, ' Бесконечность');
        e = e.replace(/null/g, ' Бесконечность');

        return e;
    },
    gi: (int) => {
        int = int.toString();

        let text = ``;
        for (let i = 0; i < int.length; i++) {
            text += `${int[i]}⃣`;
        }

        return text;
    },
    decl: (n, titles) => {
        return titles[(n % 10 === 1 && n % 100 !== 11) ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2]
    },
    random: (x, y) => {
        return y ? Math.round(Math.random() * (y - x)) + x : Math.round(Math.random() * x);
    },
    pick: (array) => {
        return array[utils.random(array.length - 1)];
    }
}

function getUnix() {
    return Date.now();
}

function unixStamp(stamp) {
    let date = new Date(stamp),
        year = date.getFullYear(),
        month = date.getMonth() + 1,
        day = date.getDate(),
        hour = date.getHours() < 10 ? "0" + date.getHours() : date.getHours(),
        mins = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes(),
        secs = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();

    return `${day}.${month}.${year}, ${hour}:${mins}:${secs}`;
}

function unixStampLeft(stamp) {
    stamp = stamp / 1000;

    let s = stamp % 60;
    stamp = (stamp - s) / 60;

    let m = stamp % 60;
    stamp = (stamp - m) / 60;

    let h = (stamp) % 24;
    let d = (stamp - h) / 24;

    let text = ``;

    if (d > 0) text += Math.floor(d) + " д. ";
    if (h > 0) text += Math.floor(h) + " ч. ";
    if (m > 0) text += Math.floor(m) + " мин. ";
    if (s > 0) text += Math.floor(s) + " с.";

    return text;
}

function generateKeyboard(array) {
    let kb = [];
    if (array.length > 40) return false;

    for (let i = 0; i < 10; i += 1) {
        if (!array.slice(i * 4, i * 4 + 4)[0]) break;
        kb.push(array.slice(i * 4, i * 4 + 4));
    }

    kb.map((arr) => {
        arr.map((button, i) => {
            arr[i] = Keyboard.textButton({
                label: button
            });
        });
    });

    return Keyboard.keyboard(kb);
}