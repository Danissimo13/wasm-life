mod utils;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[wasm_bindgen]
#[repr(u8)]
#[derive(Clone, Copy, PartialEq, Eq)]
pub enum Cell {
    Dead = 0,
    Alive = 1
}

#[wasm_bindgen]
pub struct Universe {
    width: u32,
    height: u32,
    cells: Vec<Cell>
}

#[wasm_bindgen]
impl Universe {
    pub fn new() -> Universe {
        let width: u32 = 50;
        let height: u32 = 50;

        let cells = vec![Cell::Dead; (width * height) as usize];

        Universe {
            width,
            height,
            cells,
        }
    }
    
    pub fn width(&self) -> u32 {
        self.width
    }

    pub fn height(&self) -> u32 {
        self.height
    }

    pub fn cells(&self) -> *const Cell {
        self.cells.as_ptr()
    }

    pub fn get_cell(&self, index: usize) -> Cell {
        if index < self.cells.len() {
            self.cells[index as usize] 
        }
        else {
            Cell::Dead
        }
    }

    pub fn swap_cell(&mut self, index: usize) {
        if index < self.cells.len() {
            self.cells[index] = match self.cells[index] {
                Cell::Alive => Cell::Dead,
                Cell::Dead => Cell::Alive
            }
        }
    }
    
    pub fn flush(&mut self) {
        self.cells = vec![Cell::Dead; (self.width * self.height) as usize];
    }
    
    pub fn tick(&mut self) {
        let mut next = self.cells.clone();
        
        for i in 0..self.width {
            for j in 0..self.height {
                let index = self.get_index(i, j);
                let alives = self.get_alive_count(i, j);
                
                next[index] = match (self.cells[index], alives) {
                    (Cell::Dead, 3) => Cell::Alive,
                    (Cell::Alive, x) if x > 3 || x < 2 => Cell::Dead,
                    (Cell::Alive, 2) | (Cell::Alive, 3) => Cell::Alive,
                    (otherwise, _) => otherwise
                }
            }
        }
        
        self.cells = next;
    }

    fn get_alive_count(&self, x: u32, y: u32) -> u8 {
        let mut count: u8 = 0;
        
        for i in [self.width -1, 0, 1] {
            for j in [self.height - 1, 0, 1] {
                if i == 0 && j == 0 {
                    continue;
                }
                
                let x_neighbour = (x + i) % self.width;
                let y_neighbour = (y + j) % self.height;
                
                let index = self.get_index(x_neighbour, y_neighbour);
                
                count += self.cells[index] as u8;
            }
        }
        
        count
    }

    fn get_index(&self, x: u32, y: u32) -> usize {
        ((y * self.width) + x) as usize
    }
}