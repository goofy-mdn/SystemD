import Project from '/imports/classes/Project'
import User from '/imports/classes/User';
import ShortenedEntity from '/imports/classes/ShortendEntity';
import Conversation from '/imports/classes/Conversation';

/*********************
 * Methodes des commentaires de blog
 */
Conversation.extend({
    meteorMethods: {
        /******************************************
         * Methode de création d'une nouvelle conversation
         * @param shortendCreator
         * @param shortendOtherSpeaker
         * @param brunchOfKeys
         */
        newConversation(shortendCreator, shortendOtherSpeaker, brunchOfKeys) {
            //on commence par checker touts les arguments passés a la methode
            check(shortendCreator, ShortenedEntity)
            check(shortendOtherSpeaker, ShortenedEntity)
            check(brunchOfKeys, Object)
            check(brunchOfKeys.vector, String)
            check(brunchOfKeys.encryptedConversationKeyForCreator, String)
            check(brunchOfKeys.encryptedConversationKeyForOtherSpeaker, String)
            //puis on sauvegarde la conversation encore vide pour recuperer son Id
            this.save((err,conversation_id)=>{
                if(err){
                    console.log(err)
                }else{//si tout se passe bien
                    //on cree une variable dans laquelle sera stockée notre user ou notre projet
                    let otherSpeaker
                    //on rempli notre objet a pusher dans notre projet/user.conversations
                    let entitySideConversation = {
                        conversation_id: conversation_id,
                        vector : brunchOfKeys.vector,
                        otherSpeakers  : [],
                        encryptedConversationKey : brunchOfKeys.encryptedConversationKeyForOtherSpeaker
                    }
                    entitySideConversation.otherSpeakers.push(shortendOtherSpeaker)//on ajoute aussi un speaker a la conversation
                    //si c'est un projet
                    if(shortendOtherSpeaker.isProject){
                        //on le recupere
                        otherSpeaker =  Project.findOne({_id :shortendOtherSpeaker.speaker_id })
                        //et on push au bon endroit
                        otherSpeaker.conversations.push(entitySideConversation)
                    }else{
                        //si cest un user, on fait quasiment pareil
                        otherSpeaker =  User.findOne({_id :shortendOtherSpeaker.speaker_id })
                        otherSpeaker.profile.conversations.push(entitySideConversation)
                    }
                    //puis on sauvegarde
                    otherSpeaker.save((err)=>{
                        if(err){
                            console.log(err)
                        }else{
                            //et on fait pareil pour l'autre speaker de la conversation
                            let Creator

                            let entitySideConversation = {
                                conversation_id: conversation_id,
                                vector : brunchOfKeys.vector,
                                otherSpeakers  : [],
                                encryptedConversationKey : brunchOfKeys.encryptedConversationKeyForOtherSpeaker
                            }
                            entitySideConversation.otherSpeakers.push(shortendOtherSpeaker)
                            if(shortendCreator.isProject){
                                Creator =  Project.findOne({_id :shortendCreator.speaker_id })

                                Creator.conversations.push(entitySideConversation)
                            }else{
                                Creator =  User.findOne({_id :shortendCreator.speaker_id })
                                Creator.profile.conversations.push(entitySideConversation)
                            }
                            //on le sauvegarde
                            Creator.save()
                            //et on renvoie l'id de la conversation pour pouvoir l'ouvrir juste apres
                            return conversation_id
                        }

                    })

                }
            })
        }

    }
})