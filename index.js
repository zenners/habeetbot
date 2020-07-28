require("dotenv").config();
const data = require("./data/db-config.js");
const Telegraf = require("telegraf");
const { Extra, Markup } = Telegraf;
const commandParts = require("telegraf-command-parts");

const bot = new Telegraf(process.env.BOT_TOKEN);

const session = require("telegraf/session");
const Stage = require("telegraf/stage");
const Scene = require("telegraf/scenes/base");
const { leave } = Stage;

bot.use(commandParts());

bot.start(async (ctx) => {
  const obj = { chat_id: ctx.from.id, name: ctx.from.username };
  const current_user = await data.createUser(obj);
  await ctx.reply("Welcome");
});

bot.command("daily", async (ctx) => {
  const current_user = await data.currentUser(ctx.from.id);

  // split via comma the dailies
  const rows = ctx.state.command.args.split(",").map((row) => {
    return {
      name: row.trim(),
      count: 0,
      active: true,
      user_id: current_user.id,
    };
  });

  const dailies = await data.batchInsert(rows);
  console.log(dailies);

  console.log(rows);
  ctx.reply("Hello");
});

bot.command("list", async (ctx) => {
  const dailies = await data.find();
  console.log(dailies);
  console.log("list cmd");
  return ctx.reply(
    "listing your dailies",
    Extra.markdown().markup((m) => {
      let list = [];
      dailies.forEach((daily) => {
        console.log(daily);
        list.push(
          m.callbackButton(
            `${daily.name} (${daily.count})`,
            `dailyCb_${daily.id}`
          )
        );
      });

      return m.inlineKeyboard(list);
    })
  );
});

bot.command("simple", (ctx) => {
  return ctx.replyWithHTML(
    "<b>Coke</b> or <i>Pepsi?</i>",
    Extra.markup(Markup.keyboard(["Coke", "Pepsi"]))
  );
});

bot.command("inline", (ctx) => {
  return ctx.reply(
    "<b>Coke</b> or <i>Pepsi?</i>",
    Extra.HTML().markup((m) =>
      m.inlineKeyboard([
        m.callbackButton("Coke", "Coke"),
        m.callbackButton("Pepsi", "Pepsi"),
      ])
    )
  );
});

bot.command("random", (ctx) => {
  return ctx.reply(
    "random example",
    Markup.inlineKeyboard([
      Markup.callbackButton("Coke", "Coke"),
      Markup.callbackButton("Dr Pepper", "Dr Pepper", Math.random() > 0.5),
      Markup.callbackButton("Pepsi", "Pepsi"),
    ]).extra()
  );
});

bot.command("caption", (ctx) => {
  return ctx.replyWithPhoto(
    { url: "https://picsum.photos/200/300/?random" },
    Extra.load({ caption: "Caption" })
      .markdown()
      .markup((m) =>
        m.inlineKeyboard([
          m.callbackButton("Plain", "plain"),
          m.callbackButton("Italic", "italic"),
        ])
      )
  );
});

bot.command("custom", ({ reply }) => {
  return reply(
    "Custom buttons keyboard",
    Markup.keyboard([
      ["🔍 Search", "😎 Popular"], // Row1 with 2 buttons
      ["☸ Setting", "📞 Feedback"], // Row2 with 2 buttons
      ["📢 Ads", "⭐️ Rate us", "👥 Share"], // Row3 with 3 buttons
    ])
      .oneTime()
      .resize()
      .extra()
  );
});

bot.hears("🔍 Search", (ctx) => ctx.reply("Yay!"));
bot.hears("📢 Ads", (ctx) => ctx.reply("Free hugs. Call now!"));

bot.command("special", (ctx) => {
  return ctx.reply(
    "Special buttons keyboard",
    Extra.markup((markup) => {
      return markup
        .resize()
        .keyboard([
          markup.contactRequestButton("Send contact"),
          markup.locationRequestButton("Send location"),
        ]);
    })
  );
});

bot.command("remove", async (ctx) => {});

bot.action("plain", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.editMessageCaption(
    "Caption",
    Markup.inlineKeyboard([
      Markup.callbackButton("Plain", "plain"),
      Markup.callbackButton("Italic", "italic"),
    ])
  );
});

bot.action("italic", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.editMessageCaption(
    "_Caption_",
    Extra.markdown().markup(
      Markup.inlineKeyboard([
        Markup.callbackButton("Plain", "plain"),
        Markup.callbackButton("* Italic *", "italic"),
      ])
    )
  );
});

bot.action(/dailyCb_\d+/, async (ctx) => {
  const id = ctx.match[0].split("_")[1];
  console.log(id);
  const daily = await data.findById(id);
  console.log(daily);
  await ctx.reply(
    daily[0].name,
    Markup.inlineKeyboard([
      Markup.callbackButton("Did it! 😉", `inc_${daily[0].id}`),
      Markup.callbackButton("Nope, not today 😐", "nottoday"),
    ]).extra()
  );
});

bot.action("nottoday", async (ctx) => {
  await ctx.reply("But I will tomorrow 😎 ");
});

bot.action(/inc_\d+/, async (ctx) => {
  const id = ctx.match[0].split("_")[1];
  console.log(id);
  const post = { dailies_id: id };
  const daily = await data.incrementTrans(id, post);
  console.log("inc");
  await ctx.reply("📢 Keep up the good work!");
});

bot.startPolling();
