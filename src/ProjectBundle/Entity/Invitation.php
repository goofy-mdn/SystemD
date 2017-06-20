<?php

namespace ProjectBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints\DateTime;

/**
 * Invitation
 * cette classe gere l'invitation envoyée par un projet vers un utilisateur
 * On a choisi de mettre cette classe dans le projectbundle puisque la plus
 * grande part des actions sont des actions effectuées par le projet (meme si c'est un peu le bordel pour tout suivre
 * @ORM\Table(name="invitation")
 * @ORM\Entity(repositoryClass="ProjectBundle\Repository\InvitationRepository")
 */
class Invitation
{
    /**
     * id de l'utilisateur
     * @ORM\ID
     * @ORM\ManyToOne(targetEntity="UserBundle\Entity\User", inversedBy="invitations")
     */
    private $user;

    /**
     * id du projet
     * @ORM\ID
     * @ORM\ManyToOne(targetEntity="ProjectBundle\Entity\Project", inversedBy="invitations")
     */
    private $project;

    /**
     * clef symétrique du projet chifrée avec la clef publique de l'utilisateur coté navigateur
     * @ORM\Column(name="encrypted_sym_key", type="string", length=255)
     */
    private $encryptedSymKey;

    /**
     * @var string
     * message d'invitation définit lors de l'envoi de l'invitation
     * @ORM\Column(name="content", type="text")
     */
    private $content;

    /**
     * status de l'invitation : sans réponse => 0 , acceptée => 1 , refusée => 2
     * @var int
     *
     * @ORM\Column(name="status", type="integer")
     */
    private $status;

    /**
     * @var string
     *message de réponse émis par l'utilisateur lorsqu'il envoie sa réponse
     * @ORM\Column(name="reply", type="text", nullable=true)
     */
    private $reply;

    /**
     * Invitation constructor.
     * @param $user
     * @param $project
     * @param $content
     * @param $encryptedSymKey
     */
    public function __construct($user , $project, $content, $encryptedSymKey)
{
    $this->user  = $user ;
    $this->project = $project ;
    $this->content = $content ;
    $this->status = 0 ;//par défault, le status est "pas de réponse"
    $this->encryptedSymKey= $encryptedSymKey;
}

    /**
     * Set content
     * @param string $content
     * @return Invitation
     */
    public function setContent($content)
    {
        $this->content = $content;

        return $this;
    }

    /**
     * Get content
     * @return string
     */
    public function getContent()
    {
        return $this->content;
    }

    /**
     * Set status
     * @param string $status
     * @return Invitation
     */
    public function setStatus($status)
    {
        $this->status = $status;

        return $this;
    }

    /**
     * Get status
     * @return string
     */
    public function getStatus()
    {
        return $this->status;
    }

    /**
     * Set reply
     * @param string $reply
     * @return Invitation
     */
    public function setReply($reply)
    {
        $this->reply = $reply;

        return $this;
    }

    /**
     * Get reply
     * @return string
     */
    public function getReply()
    {
        return $this->reply;
    }

    /**
     * @return mixed
     */
    public function getUser()
    {
        return $this->user;
    }

    /**
     * @param mixed $user
     */
    public function setUser($user)
    {
        $this->user = $user;
    }

    /**
     * @return mixed
     */
    public function getProject()
    {
        return $this->project;
    }

    /**
     * @param mixed $project
     */
    public function setProject($project)
    {
        $this->project = $project;
    }

    /**
     * @return mixed
     */
    public function getEncryptedSymKey()
    {
        return $this->encryptedSymKey;
    }

    /**
     * @param mixed $encryptedSymKey
     */
    public function setEncryptedSymKey($encryptedSymKey)
    {
        $this->encryptedSymKey = $encryptedSymKey;
    }
}
