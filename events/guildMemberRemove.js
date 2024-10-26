/**
 * O evento guildMemberRemove é emitido após um membro sair do servidor.
*/

module.exports = (client, member) => {
  const Discord = require('discord.js')

  const leave = new Discord.MessageEmbed()
    .setColor(process.env.COLOR)
    .setAuthor('👥 Um membro saiu do servidor.')
    .setThumbnail(`${member.user.displayAvatarURL({ dynamic: true })}?size=1024`)
    .setDescription(`${member} acabou de sair.`)
    .setFooter('2024 © Walisson Vinicius', 'https://i.imgur.com/LVacCMS.png?width=200,height=200')
    .setTimestamp()

  member.guild.channels.cache.get(process.env.SAIDA).send(leave)
}
