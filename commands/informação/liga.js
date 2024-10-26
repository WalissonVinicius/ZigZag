/**
* O Comando "liga" mostrará algumas informações da comunidade.
*/

const Discord = require('discord.js')

module.exports = {

  /**
    * Primeiro o metodo run(client, message, args) será executado pelo nosso arquivo message.js
    * Que passará os argumentos atraves do middleware que programamos.
  */

  run: function(client, message, args) {
    const embed = new Discord.MessageEmbed()
      .setTitle('ZigZag')
      .setDescription('[GitHub do criador](https://github.com/WalissonVinicius)')
      .setImage('https://i.imgur.com/KNFRvwF.png')
      .setColor(process.env.COLOR)
      .setFooter('2024 © Walisson Vinicius', 'https://i.imgur.com/LVacCMS.png?width=200,height=200')
      .setTimestamp()
    message.channel.send(embed)
  },
  /**
    * Aqui podemos colocar mais algumas configurações do comando.
  */
  conf: {},

  /**
    * Aqui exportamos ajuda do comando como o seu nome categoria, descrição, etc...
  */
  get help() {
    return {
      name: 'zigzag',
      category: 'Informação',
      description: 'Mostrará algumas informações da comunidade.',
      usage: '!zigzag',
    }
  },
}
