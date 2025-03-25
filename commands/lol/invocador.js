/** O Comando "invocador" busca informações de um invocador no League of Legends */

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

    if (!args[0]) {
      return message.channel.send(`${message.author}, você precisa fornecer o nome do invocador! Use: \`${process.env.PREFIX}invocador Nome\``)
    }

    const summonerName = args.join(' ')
    const region = process.env.LOL_REGION || 'br1'
    const api = TeemoJS(process.env.RIOT_API_KEY)
    
    try {
      const statusMsg = await message.channel.send(`Buscando informações do invocador: \`${summonerName}\`...`)
      
      // Método alternativo usando axios para buscar o invocador
      try {
        // Primeiro, tentar com TeemoJS
        const summoner = await api.get(region, 'summoner.getBySummonerName', summonerName)
        
        if (!summoner || !summoner.id) {
          // Se falhar, tentar diretamente com axios
          const encodedName = encodeURIComponent(summonerName)
          const riotApiUrl = `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodedName}`
          
          const summonerResponse = await axios.get(riotApiUrl, {
            headers: {
              'X-Riot-Token': process.env.RIOT_API_KEY
            }
          })
          
          if (summonerResponse.data && summonerResponse.data.id) {
            processSummonerData(summonerResponse.data, message, region, api)
          } else {
            await statusMsg.edit(`Invocador \`${summonerName}\` não encontrado na região ${region.toUpperCase()}.`)
          }
        } else {
          // Se funcionar com TeemoJS, continuar normalmente
          processSummonerData(summoner, message, region, api)
        }
      } catch (apiError) {
        console.error('Erro específico na API:', apiError)
        
        // Verificar se é erro de chave inválida
        if (apiError.response && apiError.response.status === 403) {
          await statusMsg.edit('❌ Erro: A chave da API da Riot Games é inválida ou expirou. O administrador do bot precisa gerar uma nova.')
        } 
        // Verificar se é erro de invocador não encontrado
        else if (apiError.response && apiError.response.status === 404) {
          await statusMsg.edit(`Invocador \`${summonerName}\` não encontrado na região ${region.toUpperCase()}.`)
        }
        // Verificar se é erro de rate limit
        else if (apiError.response && apiError.response.status === 429) {
          await statusMsg.edit('⏳ Muitas requisições foram feitas à API da Riot. Tente novamente em alguns minutos.')
        } else {
          await statusMsg.edit('Ocorreu um erro ao buscar as informações. Verifique se a API Key da Riot está correta e tente novamente.')
        }
      }
    } catch (error) {
      console.error('Erro ao buscar dados de LoL:', error)
      return message.channel.send('Ocorreu um erro ao buscar as informações. Verifique se a API Key da Riot está correta e tente novamente.')
    }
  },

  conf: {},

  help: {
    name: 'invocador',
    category: 'LoL',
    description: 'Mostra informações de um invocador no League of Legends',
    usage: '!invocador [nome do invocador]',
    aliases: ['summoner']
  }
}

// Função para processar e exibir os dados do invocador
async function processSummonerData(summoner, message, region, api) {
  try {
    // Buscar ranking do invocador
    let rankedInfo;
    
    try {
      rankedInfo = await api.get(region, 'league.getEntriesBySummonerId', summoner.id)
    } catch (rankError) {
      console.error('Erro ao buscar ranking:', rankError)
      
      // Tentar com axios se falhar
      try {
        const riotRankUrl = `https://${region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summoner.id}`
        const rankResponse = await axios.get(riotRankUrl, {
          headers: {
            'X-Riot-Token': process.env.RIOT_API_KEY
          }
        })
        
        rankedInfo = rankResponse.data
      } catch (axiosRankError) {
        console.error('Erro ao buscar ranking com axios:', axiosRankError)
        rankedInfo = []
      }
    }
    
    // Remover tags HTML do nome do invocador (por precaução)
    const cleanSummonerName = removerTagsHTML(summoner.name);
    
    // Obter versão atual do jogo para o icon
    let currentVersion = '13.12.1'; // Versão padrão como fallback
    
    try {
      const versionsResponse = await axios.get('https://ddragon.leagueoflegends.com/api/versions.json')
      currentVersion = versionsResponse.data[0]
    } catch (versionError) {
      console.error('Erro ao buscar versão atual:', versionError)
    }
    
    // Criar embed com informações
    const embed = new Discord.MessageEmbed()
      .setTitle(`🎮 Perfil do Invocador: ${cleanSummonerName}`)
      .setThumbnail(`http://ddragon.leagueoflegends.com/cdn/${currentVersion}/img/profileicon/${summoner.profileIconId}.png`)
      .addField('Nível', `${summoner.summonerLevel}`, true)
      .setColor(process.env.COLOR)
      .setFooter('2024 © League of Legends Bot', 'https://i.imgur.com/LVacCMS.png')
      .setTimestamp()
    
    // Adicionar informações de rank se disponíveis
    if (rankedInfo && rankedInfo.length > 0) {
      rankedInfo.forEach(rank => {
        const queueType = rank.queueType === 'RANKED_SOLO_5x5' ? 'Solo/Duo' : 
                         rank.queueType === 'RANKED_FLEX_SR' ? 'Flex' : rank.queueType
        
        const tier = rank.tier.charAt(0) + rank.tier.slice(1).toLowerCase()
        const winRate = ((rank.wins / (rank.wins + rank.losses)) * 100).toFixed(1)
        
        embed.addField(`Rank ${queueType}`, 
          `${tier} ${rank.rank} - ${rank.leaguePoints} PDL\n` +
          `Vitórias: ${rank.wins} | Derrotas: ${rank.losses}\n` +
          `Taxa de Vitória: ${winRate}%`, true)
      })
    } else {
      embed.addField('Ranqueada', 'Sem classificação', true)
    }
    
    return message.channel.send(embed)
  } catch (error) {
    console.error('Erro ao processar dados do invocador:', error)
    return message.channel.send('Ocorreu um erro ao processar as informações do invocador.')
  }
} 