/** O Comando "campeao" mostra informações sobre um campeão do League of Legends */

const Discord = require('discord.js')
const axios = require('axios')

// Função para remover tags HTML do texto
function removerTagsHTML(texto) {
  if (!texto) return '';
  // Remove tags de cor e outras tags HTML
  return texto.replace(/<(?:.|\n)*?>/gm, '');
}

module.exports = {
  run: async (client, message, args) => {
    if (!args[0]) {
      return message.channel.send(`${message.author}, você precisa fornecer o nome do campeão! Use: \`${process.env.PREFIX}campeao [nome do campeão]\``)
    }

    const championName = args.join(' ').toLowerCase()
    const language = 'pt_BR' // Idioma das informações
    
    try {
      const statusMsg = await message.channel.send(`Buscando informações do campeão: \`${args.join(' ')}\`...`)
      
      // Obter versão atual do jogo para o DataDragon
      let currentVersion = '13.12.1'; // Versão padrão como fallback
      
      try {
        const versionsResponse = await axios.get('https://ddragon.leagueoflegends.com/api/versions.json')
        currentVersion = versionsResponse.data[0]
      } catch (versionError) {
        console.error('Erro ao buscar versão atual:', versionError)
      }
      
      // Obter lista de campeões
      let champions = null;
      
      try {
        const championsResponse = await axios.get(`https://ddragon.leagueoflegends.com/cdn/${currentVersion}/data/${language}/champion.json`)
        champions = championsResponse.data.data
      } catch (champError) {
        console.error('Erro ao buscar lista de campeões:', champError)
        // Tentar com o idioma inglês como fallback
        try {
          const championsResponse = await axios.get(`https://ddragon.leagueoflegends.com/cdn/${currentVersion}/data/en_US/champion.json`)
          champions = championsResponse.data.data
        } catch (fallbackError) {
          await statusMsg.edit('Erro ao buscar lista de campeões. Tente novamente mais tarde.')
          return
        }
      }
      
      if (!champions) {
        await statusMsg.edit('Erro ao buscar lista de campeões. Tente novamente mais tarde.')
        return
      }
      
      // Encontrar o campeão pelo nome (pesquisa parcial)
      let championKey = null
      let exactMatch = false
      
      for (const key in champions) {
        const champ = champions[key]
        if (champ.name.toLowerCase() === championName) {
          championKey = key
          exactMatch = true
          break
        } else if (champ.name.toLowerCase().includes(championName)) {
          championKey = key
        }
      }
      
      if (!championKey) {
        await statusMsg.edit(`Campeão \`${args.join(' ')}\` não encontrado. Verifique o nome e tente novamente.`)
        return
      }
      
      // Obter informações detalhadas do campeão
      let championData = null;
      
      try {
        const championResponse = await axios.get(`https://ddragon.leagueoflegends.com/cdn/${currentVersion}/data/${language}/champion/${championKey}.json`)
        championData = championResponse.data.data[championKey]
      } catch (detailError) {
        console.error('Erro ao buscar detalhes do campeão:', detailError)
        await statusMsg.edit('Erro ao buscar detalhes do campeão. Tente novamente mais tarde.')
        return
      }
      
      if (!championData) {
        await statusMsg.edit('Erro ao buscar detalhes do campeão. Tente novamente mais tarde.')
        return
      }
      
      // Limpar descrição de tags HTML
      const blurb = removerTagsHTML(championData.blurb);
      const name = removerTagsHTML(championData.name);
      const title = removerTagsHTML(championData.title);
      
      // Criar embed com informações do campeão
      const mainEmbed = new Discord.MessageEmbed()
        .setTitle(`${name} - ${title}`)
        .setThumbnail(`https://ddragon.leagueoflegends.com/cdn/${currentVersion}/img/champion/${championData.image.full}`)
        .setDescription(blurb)
        .addField('Função', championData.tags.join(', '), true)
        .addField('Dificuldade', '⭐'.repeat(Math.round(championData.info.difficulty / 3)), true)
        .addField('Estatísticas', 
          `Ataque: ${championData.info.attack} | Defesa: ${championData.info.defense}\n` +
          `Magia: ${championData.info.magic} | Dificuldade: ${championData.info.difficulty}`)
        .setColor(process.env.COLOR)
        .setFooter('2024 © League of Legends Bot', 'https://i.imgur.com/LVacCMS.png')
        .setTimestamp()
        .setImage(`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championKey}_0.jpg`)
      
      // Enviar o primeiro embed com informações gerais
      await statusMsg.delete().catch(() => {})
      await message.channel.send(mainEmbed)
      
      // Criar embed separado para habilidades para evitar problemas de limite de caracteres
      const abilitiesEmbed = new Discord.MessageEmbed()
        .setTitle(`Habilidades: ${name}`)
        .setColor(process.env.COLOR)
        .setFooter('2024 © League of Legends Bot', 'https://i.imgur.com/LVacCMS.png')
        .setTimestamp()
      
      // Passiva
      const passiveName = removerTagsHTML(championData.passive.name);
      const passiveDescription = removerTagsHTML(championData.passive.description);
      abilitiesEmbed.addField(`Passiva: ${passiveName}`, passiveDescription)
      
      // Habilidades Q, W, E, R
      const abilities = championData.spells
      const abilityKeys = ['Q', 'W', 'E', 'R']
      
      for (let i = 0; i < abilities.length && i < abilityKeys.length; i++) {
        const abilityName = removerTagsHTML(abilities[i].name);
        const abilityDescription = removerTagsHTML(abilities[i].description);
        
        // Adicionar cada habilidade como um campo separado para evitar limite de caracteres
        abilitiesEmbed.addField(`${abilityKeys[i]}: ${abilityName}`, abilityDescription)
      }
      
      // Enviar o segundo embed com as habilidades
      return message.channel.send(abilitiesEmbed)
    } catch (error) {
      console.error('Erro ao buscar dados do campeão:', error)
      return message.channel.send('Ocorreu um erro ao buscar as informações do campeão. Tente novamente mais tarde.')
    }
  },

  conf: {},

  help: {
    name: 'campeao',
    category: 'LoL',
    description: 'Mostra informações sobre um campeão do League of Legends',
    usage: '!campeao [nome do campeão]',
    aliases: ['champion', 'champ']
  }
} 