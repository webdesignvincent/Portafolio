<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
/*Agrego rutas para realizar relacion de 1 a muchos*/
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
/*fin*/

/**
 * Project
 *
 * @ORM\Table(name="projects", indexes={@ORM\Index(name="fk_clients", columns={"client_id"})})
 * @ORM\Entity
 */
class Project
{
    /**
     * @var int
     *
     * @ORM\Column(name="id", type="integer", nullable=false)
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="IDENTITY")
     */
    private $id;

    /**
     * @var int|null
     *
     * @ORM\Column(name="creator_user", type="integer", nullable=true)
     */
    private $creatorUser;

    /**
     * @var string|null
     *
     * @ORM\Column(name="project_name", type="string", length=255, nullable=true)
     */
    private $projectName;

    /**
     * @var string|null
     *
     * @ORM\Column(name="content", type="text", length=65535, nullable=true)
     */
    private $content;

    /**
     * @var string|null
     *
     * @ORM\Column(name="phase", type="string", length=20, nullable=true)
     */
    private $phase;

    /**
     * @var \DateTime|null
     *
     * @ORM\Column(name="start_date", type="datetime", nullable=true)
     */
    private $startDate;

    /**
     * @var \DateTime|null
     *
     * @ORM\Column(name="end_date", type="datetime", nullable=true)
     */
    private $endDate;

    /**
     * @var string|null
     *
     * @ORM\Column(name="priority", type="string", length=20, nullable=true)
     */
    private $priority;

    /**
     * @var int|null
     *
     * @ORM\Column(name="project_budget", type="integer", nullable=true)
     */
    private $projectBudget;

    /**
     * @var \DateTime|null
     *
     * @ORM\Column(name="created_at", type="datetime", nullable=true)
     */
    private $createdAt;

    /**
     * @var \Client
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\Client", inversedBy="projects")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="client_id", referencedColumnName="id")
     * })
     */
    private $client;

    /*Agrego atributo tasks y constructor para hacer relacion de uno a muchos con la entidad Task*/
    
    /**
     * @ORM\OneToMany(targetEntity="App\Entity\Task", mappedBy="project")
     */
    private $tasks;
    
    public function __construct(){
        $this->tasks = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getCreatorUser(): ?int
    {
        return $this->creatorUser;
    }

    public function setcreatorUser(?int $creatorUser): self
    {
        $this->creatorUser = $creatorUser;

        return $this;
    }

    public function getProjectName(): ?string
    {
        return $this->projectName;
    }

    public function setProjectName(?string $projectName): self
    {
        $this->projectName = $projectName;

        return $this;
    }

    public function getContent(): ?string
    {
        return $this->content;
    }

    public function setContent(?string $content): self
    {
        $this->content = $content;

        return $this;
    }

    public function getPhase(): ?string
    {
        return $this->phase;
    }

    public function setPhase(?string $phase): self
    {
        $this->phase = $phase;

        return $this;
    }

    public function getStartDate(): ?\DateTimeInterface
    {
        return $this->startDate;
    }

    public function setStartDate(?\DateTimeInterface $startDate): self
    {
        $this->startDate = $startDate;

        return $this;
    }

    public function getEndDate(): ?\DateTimeInterface
    {
        return $this->endDate;
    }

    public function setEndDate(?\DateTimeInterface $endDate): self
    {
        $this->endDate = $endDate;

        return $this;
    }

    public function getPriority(): ?string
    {
        return $this->priority;
    }

    public function setPriority(?string $priority): self
    {
        $this->priority = $priority;

        return $this;
    }

    public function getProjectBudget(): ?int
    {
        return $this->projectBudget;
    }

    public function setProjectBudget(?int $projectBudget): self
    {
        $this->projectBudget = $projectBudget;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeInterface
    {
        return $this->createdAt;
    }

    public function setCreatedAt(?\DateTimeInterface $createdAt): self
    {
        $this->createdAt = $createdAt;

        return $this;
    }

    public function getClient(): ?Client
    {
        return $this->client;
    }

    public function setClient(?Client $client): self
    {
        $this->client = $client;

        return $this;
    }

    /*Crear metodo para devolver informacion*/

    /**
     * @return Collection|Task[]
     */
    public function getTasks(): Collection
    {
        return $this->tasks;
    }
    /*fin*/

public function __toString() { return $this->tasks; }

public function addTask(Task $task): self
{
    if (!$this->tasks->contains($task)) {
        $this->tasks[] = $task;
        $task->setProject($this);
    }

    return $this;
}

public function removeTask(Task $task): self
{
    if ($this->tasks->removeElement($task)) {
        // set the owning side to null (unless already changed)
        if ($task->getProject() === $this) {
            $task->setProject(null);
        }
    }

    return $this;
}

}
