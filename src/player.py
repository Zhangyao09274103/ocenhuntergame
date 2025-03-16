import pygame
import math
import os

class Player(pygame.sprite.Sprite):
    def __init__(self, x, y, level):
        super().__init__()
        self.level = level
        self.size = 30  # Initial size
        
        # Load appropriate sprite based on level
        self.load_sprite()
        
        self.rect = self.image.get_rect()
        self.rect.x = x
        self.rect.y = y
        
        # Movement attributes
        self.speed = 5
        self.direction = pygame.math.Vector2(0, 0)
        self.position = pygame.math.Vector2(x, y)
        self.facing_right = True
        
    def load_sprite(self):
        # Default orange rectangle as fallback
        self.image = pygame.Surface([self.size, self.size])
        self.image.fill((255, 165, 0))
        
        # Try to load the appropriate sprite based on level
        try:
            sprite_name = {
                1: "small_fish.png",
                2: "crab.png",
                3: "sea_snake.png",
                4: "shark.png"
            }.get(self.level, "small_fish.png")
            
            img_path = os.path.join(os.path.dirname(__file__), "..", "assets", "images", sprite_name)
            if os.path.exists(img_path):
                self.image = pygame.image.load(img_path).convert_alpha()
                # Scale image to match current size
                self.image = pygame.transform.scale(self.image, (self.size, self.size))
        except pygame.error:
            pass  # Keep default rectangle if sprite loading fails
        
    def move(self, keys):
        # Reset direction
        self.direction = pygame.math.Vector2(0, 0)
        
        # Update direction based on key presses
        if keys[pygame.K_LEFT] or keys[pygame.K_a]:
            self.direction.x = -1
            self.facing_right = False
        if keys[pygame.K_RIGHT] or keys[pygame.K_d]:
            self.direction.x = 1
            self.facing_right = True
        if keys[pygame.K_UP] or keys[pygame.K_w]:
            self.direction.y = -1
        if keys[pygame.K_DOWN] or keys[pygame.K_s]:
            self.direction.y = 1
            
        # Normalize diagonal movement
        if self.direction.length() > 0:
            self.direction = self.direction.normalize()
        
        # Update position
        self.position += self.direction * self.speed
        
        # Keep player on screen
        self.position.x = max(0, min(self.position.x, 1024 - self.size))
        self.position.y = max(0, min(self.position.y, 768 - self.size))
        
        # Update rectangle position
        self.rect.x = self.position.x
        self.rect.y = self.position.y
        
        # Flip sprite based on direction
        if not self.facing_right:
            self.image = pygame.transform.flip(self.image, True, False)
    
    def grow(self):
        """Increase the size of the player when eating prey"""
        old_size = self.size
        self.size += 2
        
        # Store the current facing direction
        was_facing_right = self.facing_right
        
        # Reload and resize sprite
        self.load_sprite()
        
        # Restore facing direction
        if not was_facing_right:
            self.image = pygame.transform.flip(self.image, True, False)
        
        # Maintain center position when growing
        old_center = self.rect.center
        self.rect = self.image.get_rect()
        self.rect.center = old_center
    
    def can_eat(self, other_size):
        """Determine if this player can eat another creature"""
        return self.size > other_size * 1.2
    
    def can_be_eaten(self, other_size):
        """Determine if this player can be eaten by another creature"""
        return other_size > self.size * 1.2
    
    def update(self, keys):
        self.move(keys) 