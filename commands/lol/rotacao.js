/** O Comando "rotacao" mostra os campeões gratuitos da semana */

const Discord = require('discord.js')
const TeemoJS = require('teemojs')
const axios = require('axios')

// Função para remover tags HTML do texto
function removerTagsHTML(texto) {
  if (!texto) return '';
  // Remove tags de cor e outras tags HTML
  return texto.replace(/<(?:.|\n)*?>/gm, '');
}

module.exports = {
  run: async (client, message, args) => {
    if (!process.env.RIOT_API_KEY) {
      return message.channel.send('A chave da API da Riot Games não está configurada no arquivo `.env`')
    }

    const api = TeemoJS(process.env.RIOT_API_KEY)
    const region = process.env.LOL_REGION || 'br1'
    const language = 'pt_BR'
    
    try {
      const statusMsg = await message.channel.send('Buscando rotação gratuita de campeões...')
      
      // Tentar obter a rotação de campeões
      let rotation = null;
      
      try {
        // Primeiro tentar com TeemoJS
        rotation = await api.get(region, 'champion.getChampionInfo')
        
        if (!rotation || !rotation.freeChampionIds) {
          // Se falhar, tentar com axios diretamente
          const riotApiUrl = `https://${region}.api.riotgames.com/lol/platform/v3/champion-rotations`
          const rotationResponse = await axios.get(riotApiUrl, {
            headers: {
              'X-Riot-Token': process.env.RIOT_API_KEY
            }
          })
          
          rotation = rotationResponse.data
        }
      } catch (apiError) {
        console.error('Erro específico na API rotação:', apiError);
        
        // Verificar tipos específicos de erro
        if (apiError.response && apiError.response.status === 403) {
          await statusMsg.edit('❌ Erro: A chave da API da Riot Games é inválida ou expirou. O administrador do bot precisa gerar uma nova.')
          return
        } else if (apiError.response && apiError.response.status === 429) {
          await statusMsg.edit('⏳ Muitas requisições foram feitas à API da Riot. Tente novamente em alguns minutos.')
          return
        } else {
          // Tentar com axios diretamente se falhar
          try {
            const riotApiUrl = `https://${region}.api.riotgames.com/lol/platform/v3/champion-rotations`
            const rotationResponse = await axios.get(riotApiUrl, {
              headers: {
                'X-Riot-Token': process.env.RIOT_API_KEY
              }
            })
            
            rotation = rotationResponse.data
          } catch (axiosError) {
            console.error('Erro ao buscar com axios:', axiosError)
            await statusMsg.edit('Não foi possível obter a rotação de campeões. Tente novamente mais tarde.')
            return
          }
        }
      }
      
      if (!rotation || !rotation.freeChampionIds) {
        await statusMsg.edit('Não foi possível obter a rotação de campeões. Tente novamente mais tarde.')
        return
      }
      
      // Obter versão atual do jogo
      let currentVersion = '13.12.1'; // Versão padrão como fallback
      
      try {
        const versionsResponse = await axios.get('https://ddragon.leagueoflegends.com/api/versions.json')
        currentVersion = versionsResponse.data[0]
      } catch (versionError) {
        console.error('Erro ao buscar versão atual:', versionError)
      }
      
      // Obter lista de campeões para converter IDs em nomes
      let championsData = null;
      
      try {
        const championsResponse = await axios.get(`https://ddragon.leagueoflegends.com/cdn/${currentVersion}/data/${language}/champion.json`)
        championsData = championsResponse.data.data
      } catch (champError) {
        console.error('Erro ao buscar dados de campeões:', champError)
        // Tentar com o idioma inglês como fallback
        try {
          const championsResponse = await axios.get(`https://ddragon.leagueoflegends.com/cdn/${currentVersion}/data/en_US/champion.json`)
          championsData = championsResponse.data.data
        } catch (fallbackError) {
          await statusMsg.edit('Erro ao buscar informações dos campeões. Tente novamente mais tarde.')
          return
        }
      }
      
      if (!championsData) {
        await statusMsg.edit('Erro ao buscar informações dos campeões. Tente novamente mais tarde.')
        return
      }
      
      // Criar mapa de ID para informações do campeão
      const championsMap = new Map()
      
      for (const champKey in championsData) {
        const champion = championsData[champKey]
        championsMap.set(parseInt(champion.key), {
          id: champKey,
          name: removerTagsHTML(champion.name),
          title: removerTagsHTML(champion.title)
        })
      }
      
      // Criar embed para rotação normal
      const embed = new Discord.MessageEmbed()
        .setTitle('🔄 Rotação Gratuita de Campeões')
        .setDescription('Confira os campeões gratuitos desta semana!')
        .setColor(process.env.COLOR)
        .setFooter('2024 © League of Legends Bot', 'https://i.imgur.com/LVacCMS.png')
        .setTimestamp()
      
      // Adicionar campeões da rotação normal
      let normalRotationText = ''
      const championIcons = []
      
      for (const championId of rotation.freeChampionIds) {
        const champion = championsMap.get(championId)
        if (champion) {
          normalRotationText += `• **${champion.name}** (${champion.title})\n`
          championIcons.push(`https://ddragon.leagueoflegends.com/cdn/${currentVersion}/img/champion/${champion.id}.png`)
        }
      }
      
      embed.addField('Rotação Gratuita', normalRotationText || 'Não há campeões na rotação gratuita.')
      
      // Adicionar campeões da rotação para novos jogadores (abaixo do nível 10)
      if (rotation.freeChampionIdsForNewPlayers && rotation.freeChampionIdsForNewPlayers.length > 0) {
        let newPlayerRotationText = ''
        
        for (const championId of rotation.freeChampionIdsForNewPlayers) {
          const champion = championsMap.get(championId)
          if (champion) {
            newPlayerRotationText += `• **${champion.name}** (${champion.title})\n`
          }
        }
        
        embed.addField('Rotação para Novos Jogadores (abaixo do nível 10)', 
          newPlayerRotationText || 'Não há campeões na rotação para novos jogadores.')
      }
      
      // Adicionar uma imagem com até 5 ícones de campeões na rotação
      if (championIcons.length > 0) {
        const iconsToShow = championIcons.slice(0, 5)
        embed.setThumbnail(iconsToShow[0])
      }
      
      await statusMsg.delete().catch(() => {})
      return message.channel.send(embed)
    } catch (error) {
      console.error('Erro ao buscar rotação de campeões:', error)
      return message.channel.send('Ocorreu um erro ao buscar a rotação de campeões. Verifique se a API Key da Riot está correta e tente novamente.')
    }
  },

  conf: {},

  help: {
    name: 'rotacao',
    category: 'LoL',
    description: 'Mostra os campeões gratuitos da semana no League of Legends',
    usage: '!rotacao',
    aliases: ['rotation', 'freeweek', 'free']
  }
} 