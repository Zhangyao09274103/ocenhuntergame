import pygame
import sys
import random
from enum import Enum
from player import Player
from creature import CreatureManager
import os

# Initialize Pygame and its mixer
pygame.init()
pygame.mixer.init()

# Constants
WINDOW_WIDTH = 1024
WINDOW_HEIGHT = 768
FPS = 60

# Colors
BLUE = (0, 105, 148)
WHITE = (255, 255, 255)
BUBBLE_COLOR = (255, 255, 255, 128)

# Asset paths
ASSET_DIR = os.path.join(os.path.dirname(__file__), "..", "assets")
IMG_DIR = os.path.join(ASSET_DIR, "images")
SOUND_DIR = os.path.join(ASSET_DIR, "sounds")

class Particle:
    def __init__(self, x, y, color, size, speed):
        self.x = x
        self.y = y
        self.color = color
        self.size = size
        self.speed = speed
        self.alpha = 255
        self.fade_speed = random.randint(5, 10)
    
    def update(self):
        self.y -= self.speed
        self.alpha = max(0, self.alpha - self.fade_speed)
        return self.alpha > 0

class GameState(Enum):
    MENU = 1
    PLAYING = 2
    GAME_OVER = 3

class Game:
    def __init__(self):
        self.screen = pygame.display.set_mode((WINDOW_WIDTH, WINDOW_HEIGHT))
        pygame.display.set_caption("Ocean Hunter")
        self.clock = pygame.time.Clock()
        self.state = GameState.MENU
        self.current_level = 1
        self.score = 0
        
        # Initialize background
        self.bg_layers = []
        self.load_background()
        
        # Initialize sounds
        self.sounds = {}
        self.load_sounds()
        
        # Initialize particles
        self.particles = []
        
        # Initialize player and creatures
        self.player = Player(WINDOW_WIDTH//2, WINDOW_HEIGHT//2, self.current_level)
        self.creature_manager = CreatureManager()
        self.creature_manager.spawn_creatures(self.current_level)
        
        # Start background music
        if 'background_music' in self.sounds:
            self.sounds['background_music'].play(-1)  # Loop indefinitely
    
    def load_background(self):
        try:
            # Load background layers (if they exist)
            for i in range(3):  # We'll use 3 layers for parallax effect
                bg_path = os.path.join(IMG_DIR, f'background_layer_{i}.png')
                if os.path.exists(bg_path):
                    img = pygame.image.load(bg_path).convert_alpha()
                    img = pygame.transform.scale(img, (WINDOW_WIDTH, WINDOW_HEIGHT))
                    self.bg_layers.append(img)
        except pygame.error:
            # If images don't exist, create gradient background
            self.bg_layers = [self.create_gradient_background()]
    
    def create_gradient_background(self):
        surface = pygame.Surface((WINDOW_WIDTH, WINDOW_HEIGHT))
        for y in range(WINDOW_HEIGHT):
            color = (0, max(0, min(255, 105 + y//4)), max(0, min(255, 148 + y//4)))
            pygame.draw.line(surface, color, (0, y), (WINDOW_WIDTH, y))
        return surface
    
    def load_sounds(self):
        sound_files = {
            'eat': 'eat.wav',
            'hurt': 'hurt.wav',
            'level_up': 'level_up.wav',
            'background_music': 'background.wav'
        }
        
        for sound_name, filename in sound_files.items():
            try:
                path = os.path.join(SOUND_DIR, filename)
                if os.path.exists(path):
                    if sound_name == 'background_music':
                        self.sounds[sound_name] = pygame.mixer.music.load(path)
                    else:
                        self.sounds[sound_name] = pygame.mixer.Sound(path)
            except pygame.error:
                print(f"Couldn't load sound: {filename}")
    
    def add_particles(self, x, y, color, count=5):
        for _ in range(count):
            size = random.randint(2, 6)
            speed = random.uniform(1, 3)
            self.particles.append(Particle(x, y, color, size, speed))
    
    def update_particles(self):
        self.particles = [p for p in self.particles if p.update()]
    
    def draw_particles(self):
        for particle in self.particles:
            surf = pygame.Surface((particle.size, particle.size), pygame.SRCALPHA)
            pygame.draw.circle(surf, (*particle.color, particle.alpha), 
                             (particle.size//2, particle.size//2), particle.size//2)
            self.screen.blit(surf, (particle.x, particle.y))

    def handle_events(self):
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                return False
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE:
                    return False
                if self.state == GameState.MENU and event.key == pygame.K_SPACE:
                    self.state = GameState.PLAYING
                elif self.state == GameState.GAME_OVER and event.key == pygame.K_SPACE:
                    self.__init__()
        return True

    def check_collisions(self):
        # Check collisions with prey
        for prey in self.creature_manager.prey_group:
            if pygame.sprite.collide_rect(self.player, prey):
                if self.player.can_eat(prey.size):
                    self.score += 10
                    self.player.grow()
                    # Add eating particles
                    self.add_particles(prey.rect.centerx, prey.rect.centery, (255, 255, 0))
                    if 'eat' in self.sounds:
                        self.sounds['eat'].play()
                    prey.kill()
                    
        # Check collisions with predators
        for predator in self.creature_manager.predator_group:
            if pygame.sprite.collide_rect(self.player, predator):
                if self.player.can_be_eaten(predator.size):
                    if 'hurt' in self.sounds:
                        self.sounds['hurt'].play()
                    self.state = GameState.GAME_OVER
                elif self.player.can_eat(predator.size):
                    self.score += 50
                    self.player.grow()
                    self.add_particles(predator.rect.centerx, predator.rect.centery, (255, 0, 0))
                    if 'eat' in self.sounds:
                        self.sounds['eat'].play()
                    predator.kill()
        
        # Check for level completion
        if len(self.creature_manager.prey_group) == 0:
            self.current_level = min(self.current_level + 1, 4)
            if 'level_up' in self.sounds:
                self.sounds['level_up'].play()
            self.player = Player(WINDOW_WIDTH//2, WINDOW_HEIGHT//2, self.current_level)
            self.creature_manager.spawn_creatures(self.current_level)

    def update(self):
        if self.state == GameState.PLAYING:
            # Update player
            keys = pygame.key.get_pressed()
            self.player.update(keys)
            
            # Update creatures
            self.creature_manager.update(self.player.position)
            
            # Update particles
            self.update_particles()
            
            # Check collisions
            self.check_collisions()
            
            # Add ambient bubbles
            if random.random() < 0.1:  # 10% chance each frame
                x = random.randint(0, WINDOW_WIDTH)
                self.add_particles(x, WINDOW_HEIGHT, BUBBLE_COLOR, count=1)
    
    def draw_background(self):
        if self.bg_layers:
            for layer in self.bg_layers:
                self.screen.blit(layer, (0, 0))
        else:
            self.screen.fill(BLUE)
    
    def draw(self):
        # Draw background
        self.draw_background()
        
        if self.state == GameState.MENU:
            self.draw_menu()
        elif self.state == GameState.PLAYING:
            self.draw_game()
        elif self.state == GameState.GAME_OVER:
            self.draw_game_over()
        
        # Draw particles on top
        self.draw_particles()
            
        pygame.display.flip()
    
    def draw_menu(self):
        font = pygame.font.Font(None, 74)
        title = font.render('Ocean Hunter', True, WHITE)
        start = font.render('Press SPACE to Start', True, WHITE)
        
        self.screen.blit(title, (WINDOW_WIDTH//2 - title.get_width()//2, WINDOW_HEIGHT//3))
        self.screen.blit(start, (WINDOW_WIDTH//2 - start.get_width()//2, WINDOW_HEIGHT//2))
    
    def draw_game(self):
        # Draw all sprites
        self.creature_manager.prey_group.draw(self.screen)
        self.creature_manager.predator_group.draw(self.screen)
        self.screen.blit(self.player.image, self.player.rect)
        
        # Draw UI
        font = pygame.font.Font(None, 36)
        score_text = font.render(f'Score: {self.score}', True, WHITE)
        level_text = font.render(f'Level: {self.current_level}', True, WHITE)
        size_text = font.render(f'Size: {self.player.size}', True, WHITE)
        
        self.screen.blit(score_text, (10, 10))
        self.screen.blit(level_text, (10, 50))
        self.screen.blit(size_text, (10, 90))
    
    def draw_game_over(self):
        font = pygame.font.Font(None, 74)
        game_over = font.render('Game Over', True, WHITE)
        restart = font.render('Press SPACE to Restart', True, WHITE)
        final_score = font.render(f'Final Score: {self.score}', True, WHITE)
        
        self.screen.blit(game_over, (WINDOW_WIDTH//2 - game_over.get_width()//2, WINDOW_HEIGHT//3))
        self.screen.blit(final_score, (WINDOW_WIDTH//2 - final_score.get_width()//2, WINDOW_HEIGHT//2))
        self.screen.blit(restart, (WINDOW_WIDTH//2 - restart.get_width()//2, WINDOW_HEIGHT*2//3))
    
    def run(self):
        running = True
        while running:
            running = self.handle_events()
            self.update()
            self.draw()
            self.clock.tick(FPS)
        
        pygame.quit()
        sys.exit()

if __name__ == "__main__":
    game = Game()
    game.run() 