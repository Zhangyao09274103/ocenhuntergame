import pygame
import random
import math
import os

class Creature(pygame.sprite.Sprite):
    def __init__(self, x, y, size, speed, color, is_predator=False, sprite_name=None):
        super().__init__()
        self.size = size
        self.speed = speed
        self.is_predator = is_predator
        self.facing_right = True
        
        # Create the creature's image
        self.load_sprite(sprite_name, color)
        self.rect = self.image.get_rect()
        self.rect.x = x
        self.rect.y = y
        
        # Movement attributes
        self.position = pygame.math.Vector2(x, y)
        self.direction = pygame.math.Vector2(random.uniform(-1, 1), random.uniform(-1, 1)).normalize()
        self.target = None
        
    def load_sprite(self, sprite_name, fallback_color):
        # Default colored rectangle as fallback
        self.image = pygame.Surface([self.size, self.size])
        self.image.fill(fallback_color)
        
        # Try to load sprite if provided
        if sprite_name:
            try:
                img_path = os.path.join(os.path.dirname(__file__), "..", "assets", "images", sprite_name)
                if os.path.exists(img_path):
                    self.image = pygame.image.load(img_path).convert_alpha()
                    self.image = pygame.transform.scale(self.image, (self.size, self.size))
            except pygame.error:
                pass  # Keep default rectangle if sprite loading fails
        
    def update(self, player_pos=None):
        old_x = self.position.x
        
        if self.is_predator and player_pos:
            # Predators chase the player
            to_player = pygame.math.Vector2(player_pos) - self.position
            if to_player.length() < 300:  # Only chase within range
                self.direction = to_player.normalize()
        else:
            # Random movement with occasional direction changes
            if random.random() < 0.02:  # 2% chance to change direction each frame
                self.direction = pygame.math.Vector2(
                    random.uniform(-1, 1),
                    random.uniform(-1, 1)
                ).normalize()
        
        # Update position
        self.position += self.direction * self.speed
        
        # Update facing direction
        if self.position.x > old_x:
            self.facing_right = True
        elif self.position.x < old_x:
            self.facing_right = False
        
        # Wrap around screen edges
        if self.position.x < 0:
            self.position.x = 1024
        elif self.position.x > 1024:
            self.position.x = 0
        if self.position.y < 0:
            self.position.y = 768
        elif self.position.y > 768:
            self.position.y = 0
            
        # Update rectangle position
        self.rect.x = self.position.x
        self.rect.y = self.position.y
        
        # Flip sprite based on direction
        if not self.facing_right:
            self.image = pygame.transform.flip(self.image, True, False)
        
class CreatureManager:
    def __init__(self):
        self.prey_group = pygame.sprite.Group()
        self.predator_group = pygame.sprite.Group()
        
    def spawn_creatures(self, level):
        # Clear existing creatures
        self.prey_group.empty()
        self.predator_group.empty()
        
        if level == 1:  # Small Fish World
            # Spawn plankton (tiny prey)
            for _ in range(15):
                self._spawn_prey(size=10, speed=2, color=(0, 255, 0),
                               sprite_name="plankton.png")
            # Spawn small fish (prey)
            for _ in range(10):
                self._spawn_prey(size=15, speed=3, color=(0, 255, 255),
                               sprite_name="tiny_fish.png")
            # Spawn medium fish (predators)
            for _ in range(5):
                self._spawn_predator(size=40, speed=4, color=(255, 0, 0),
                                   sprite_name="medium_fish.png")
                
        elif level == 2:  # Crab's Domain
            # Spawn small fish and shrimp
            for _ in range(12):
                self._spawn_prey(size=20, speed=3, color=(255, 192, 203),
                               sprite_name="shrimp.png")
            # Spawn octopus and large crabs
            for _ in range(6):
                self._spawn_predator(size=45, speed=3.5, color=(128, 0, 128),
                                   sprite_name="octopus.png")
                
        elif level == 3:  # Sea Snake Adventure
            # Spawn medium fish
            for _ in range(8):
                self._spawn_prey(size=25, speed=4, color=(255, 215, 0),
                               sprite_name="medium_fish.png")
            # Spawn sharks and moray eels
            for _ in range(4):
                self._spawn_predator(size=50, speed=4.5, color=(139, 69, 19),
                                   sprite_name="moray_eel.png")
                
        elif level == 4:  # Shark Territory
            # Spawn large fish and sea snakes
            for _ in range(6):
                self._spawn_prey(size=30, speed=4.5, color=(70, 130, 180),
                               sprite_name="sea_snake.png")
            # Spawn killer whales
            for _ in range(3):
                self._spawn_predator(size=60, speed=5, color=(0, 0, 0),
                                   sprite_name="killer_whale.png")
    
    def _spawn_prey(self, size, speed, color, sprite_name=None):
        x = random.randint(0, 1024)
        y = random.randint(0, 768)
        creature = Creature(x, y, size, speed, color, is_predator=False,
                          sprite_name=sprite_name)
        self.prey_group.add(creature)
        
    def _spawn_predator(self, size, speed, color, sprite_name=None):
        x = random.randint(0, 1024)
        y = random.randint(0, 768)
        creature = Creature(x, y, size, speed, color, is_predator=True,
                          sprite_name=sprite_name)
        self.predator_group.add(creature)
        
    def update(self, player_pos):
        for creature in self.prey_group:
            creature.update()
        for creature in self.predator_group:
            creature.update(player_pos) 