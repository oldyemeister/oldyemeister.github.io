module drawmario(
    input CLOCK_50,
    input [3:0] KEY,   // Keys for movement control
    input [9:0] SW,    // Switch for reset
    output [7:0] VGA_R,
    output [7:0] VGA_G,
    output [7:0] VGA_B,
	 output [1:0]LEDR,
    output VGA_HS,
    output VGA_VS,
    output VGA_BLANK_N,
    output VGA_SYNC_N,
    output VGA_CLK,
	 
	 inout PS2_CLK,
	 inout PS2_DAT
);
wire [7:0] received_data;
	 wire received_data_en;
	 reg [7:0] lreceived_data;
	 reg [7:0] llreceived_data;
	 reg [1:0] dir;
	 reg jump;
	 reg goingdown;
	 reg grav;
	 reg [7:0] ystart;
	 wire jumpcheck;
	 always @(posedge CLOCK_50)
		begin
		if (SW[0] == 1'b0)
			lreceived_data <= 8'h00;
		else if (received_data_en == 1'b1)
			llreceived_data <= lreceived_data;
			lreceived_data <= received_data;
		end
	 
	 PS2_Controller P1 (
	// Inputs
	.CLOCK_50				(CLOCK_50),
	.reset				(~SW[0]),

	// Bidirectionals
	.PS2_CLK			(PS2_CLK),
 	.PS2_DAT			(PS2_DAT),

	// Outputs
	.received_data		(received_data),
	.received_data_en	(received_data_en)
);


    // VGA display parameters
    parameter SCREEN_WIDTH = 320;
    parameter SCREEN_HEIGHT = 240;
    parameter MARIO_SIZE = 16; // Mario sprite size is 16x16
	 parameter BARREL_SIZE = 12;
	 parameter YOUWIN_SIZE = 32;

    // Mario position registers
    reg [8:0] mario_x;
    reg [7:0] mario_y;
	 reg cyan_detected_reg;

	 reg [8:0] barrel_x;
	 reg [7:0] barrel_y;
	 reg [8:0] barrel_x2;
	 reg [7:0] barrel_y2;
	 
	 reg [8:0] youwin_x;
	 reg [7:0] youwin_y;
	 reg [3:0] bcyan_detected_reg;
    // Horizontal and vertical counters
    reg [8:0] h_counter;
    reg [7:0] v_counter;

    // VGA signal variables
    reg [8:0] VGA_X;  // Pixel X-coordinate
    reg [7:0] VGA_Y;  // Pixel Y-coordinate
    reg [2:0] VGA_COLOR;
    reg plot;
    wire resetn = SW[0];

    // Clock divider for movement speed control
    reg [19:0] move_counter;
    wire move_tick = (move_counter == 0);

    // Standing detection logic
    wire standing_above, standing_below;
    reg standing_above_reg, standing_below_reg;
	 
	 wire bstanding_above;
	 wire bstanding_below;
	 wire bstanding_above2;
	 wire bstanding_below2;
	 wire noth;
    // Register standing signals to avoid combinational timing issues
    always @(posedge CLOCK_50) begin
        standing_above_reg <= standing_above;
        standing_below_reg <= standing_below;
    end

	 touching_magentatop touchtop (
        .mario_x(mario_x),
        .mario_y(mario_y),
        .SCREEN_WIDTH(SCREEN_WIDTH),
        .SCREEN_HEIGHT(SCREEN_HEIGHT),
        .CLOCK_50(CLOCK_50),
        .standing_above(standing_above)
    );
    // Instantiate the `touching_magenta` module
    touching_magenta touch (
        .mario_x(mario_x),
        .mario_y(mario_y),
        .SCREEN_WIDTH(SCREEN_WIDTH),
        .SCREEN_HEIGHT(SCREEN_HEIGHT),
        .CLOCK_50(CLOCK_50),
		  .size(MARIO_SIZE),
        .standing_below(standing_below),
		  .jump(jumpcheck)
    );
	 // FOR BARRELS
	 touching_magenta1 touch1 (
        .mario_x(barrel_x),
        .mario_y(barrel_y),
        .SCREEN_WIDTH(SCREEN_WIDTH),
        .SCREEN_HEIGHT(SCREEN_HEIGHT),
        .CLOCK_50(CLOCK_50),
		  .size(BARREL_SIZE),
        .standing_below(bstanding_below),
		  .jump(noth)
    );
	 touching_magenta1 touch2 (
        .mario_x(barrel_x2),
        .mario_y(barrel_y2),
        .SCREEN_WIDTH(SCREEN_WIDTH),
        .SCREEN_HEIGHT(SCREEN_HEIGHT),
        .CLOCK_50(CLOCK_50),
		  .size(BARREL_SIZE),
        .standing_below(bstanding_below2),
		  .jump(noth)
    );
	 /*touching_magenta touch3 (
        .mario_x(barrel_x[26:18]),
        .mario_y(barrel_y[23:16]),
        .SCREEN_WIDTH(SCREEN_WIDTH),
        .SCREEN_HEIGHT(SCREEN_HEIGHT),
        .CLOCK_50(CLOCK_50),
        .standing_below(bstanding_below[2]),
		  .jump(noth)
    );
	 touching_magenta touch4 (
        .mario_x(barrel_x[35:27]),
        .mario_y(barrel_y[31:24]),
        .SCREEN_WIDTH(SCREEN_WIDTH),
        .SCREEN_HEIGHT(SCREEN_HEIGHT),
        .CLOCK_50(CLOCK_50),
        .standing_below(bstanding_below[3]),
		  .jump(noth)
    );*/
	wire touchingbar, touchingbar2;
	touching_barrel touchbarrels (
        .mario_x(mario_x),
        .mario_y(mario_y),
		  .barrel_x(barrel_x),
		  .barrel_y(barrel_y),
        .SCREEN_WIDTH(SCREEN_WIDTH),
        .SCREEN_HEIGHT(SCREEN_HEIGHT),
        .CLOCK_50(CLOCK_50),
        .touching(touchingbar),
    );
	 touching_barrel touchbarrels2 (
        .mario_x(mario_x),
        .mario_y(mario_y),
		  .barrel_x(barrel_x2),
		  .barrel_y(barrel_y2),
        .SCREEN_WIDTH(SCREEN_WIDTH),
        .SCREEN_HEIGHT(SCREEN_HEIGHT),
        .CLOCK_50(CLOCK_50),
        .touching(touchingbar2),
    );
	 /*always @(CLOCK_50) begin
		if (touchingbar) begin
			resetn <= 0;
		end
	end*/
			
	 
    // Mario's sprite color
    // Mario ROM interface (mario.mif file for Mario sprite)
wire [2:0] mario_color;

// Flip mario_pixel_x to handle horizontal mirroring
wire [8:0] mario_pixel_x = (MARIO_SIZE - 1) - (VGA_X - mario_x); // Flipped X coordinate
wire [7:0] mario_pixel_y = VGA_Y - mario_y;                     // Relative Y coordinate within Mario

// Check if the current pixel is within Mario's active area
wire mario_active = (VGA_X >= mario_x) && (VGA_X < mario_x + MARIO_SIZE) &&
                    (VGA_Y >= mario_y) && (VGA_Y < mario_y + MARIO_SIZE);

						  
wire [2:0] barrel_color;

// Flip mario_pixel_x to handle horizontal mirroring
wire [8:0] barrel_pixel_x = VGA_X-barrel_x; // Flipped X coordinate
wire [7:0] barrel_pixel_y = VGA_Y-barrel_y;                     // Relative Y coordinate within 



// Check if the current pixel is within Mario's active area
wire barrel_active = (VGA_X >= barrel_x) && (VGA_X < barrel_x + BARREL_SIZE) &&
                    (VGA_Y >= barrel_y) && (VGA_Y < barrel_y + BARREL_SIZE);

barrel_mem barrel_mem (
    .address(barrel_pixel_y * BARREL_SIZE + barrel_pixel_x), // Adjusted address for flipped sprite
    .clock(CLOCK_50),
    .q(barrel_color) // Output Mario pixel color
);

						  
wire [2:0] barrel_color2;

// Flip mario_pixel_x to handle horizontal mirroring
wire [8:0] barrel_pixel_x2 = VGA_X-barrel_x2; // Flipped X coordinate
wire [7:0] barrel_pixel_y2 = VGA_Y-barrel_y2;                     // Relative Y coordinate within 



// Check if the current pixel is within Mario's active area
wire barrel_active2 = (VGA_X >= barrel_x2) && (VGA_X < barrel_x2 + BARREL_SIZE) &&
                    (VGA_Y >= barrel_y2) && (VGA_Y < barrel_y2 + BARREL_SIZE);

barrel_mem2 barrel_mem2 (
    .address(barrel_pixel_y2 * BARREL_SIZE + barrel_pixel_x2), // Adjusted address for flipped sprite
    .clock(CLOCK_50),
    .q(barrel_color2) // Output Mario pixel color
);



wire [2:0] youwin_color;

// Flip mario_pixel_x to handle horizontal mirroring
wire [10:0] youwin_pixel_x = VGA_X-youwin_x; // Flipped X coordinate
wire [10:0] youwin_pixel_y = VGA_Y-youwin_y;                     // Relative Y coordinate within 



// Check if the current pixel is within Mario's active area
wire youwin_active = (VGA_X >= youwin_x) && (VGA_X < youwin_x + YOUWIN_SIZE) &&
                    (VGA_Y >= youwin_y) && (VGA_Y < youwin_y + YOUWIN_SIZE);

youwin youwin (
    .address(youwin_pixel_y * YOUWIN_SIZE + youwin_pixel_x), // Adjusted address for flipped sprite
    .clock(CLOCK_50),
    .q(youwin_color) // Output Mario pixel color
);


reg downnow;
reg [2:0] lockeddir;
reg prevjump;
reg justmoved;
/*if (~jump) begin
	assign downnow = 0;
end*/


// Address for Mario's pixel in memory
object_mem mario_mem (
    .address(mario_pixel_y * MARIO_SIZE + mario_pixel_x), // Adjusted address for flipped sprite
    .clock(CLOCK_50),
    .q(mario_color) // Output Mario pixel color
);

wire cyan_detected;
touching_cyan cyan_check (
    .mario_x(mario_x),
    .mario_y(mario_y),
    .SCREEN_WIDTH(SCREEN_WIDTH),
    .SCREEN_HEIGHT(SCREEN_HEIGHT),
    .CLOCK_50(CLOCK_50),
    .cyan(cyan_detected)
);
   always @(posedge CLOCK_50) begin
	 
        cyan_detected_reg <= cyan_detected;
    end
assign LEDR[1] = cyan_detected;

wire left_bottom_magenta_detected;
wire leftmagblack;
wire rightmagblack;

touching_left_bottom_magenta check_stairleft (
    .mario_x(mario_x),
    .mario_y(mario_y),
    .SCREEN_WIDTH(SCREEN_WIDTH),
    .SCREEN_HEIGHT(SCREEN_HEIGHT),
    .CLOCK_50(CLOCK_50),
    .left_bottom_magenta(left_bottom_magenta_detected)
);

wire right_bottom_magenta_detected;
touching_right_bottom_magenta check_stairright (
    .mario_x(mario_x),
    .mario_y(mario_y),
    .SCREEN_WIDTH(SCREEN_WIDTH),
    .SCREEN_HEIGHT(SCREEN_HEIGHT),
    .CLOCK_50(CLOCK_50),
    .right_bottom_magenta(right_bottom_magenta_detected)
);

/*left_magentathenblack ch1 (
    .mario_x(mario_x),
    .mario_y(mario_y),
    .SCREEN_WIDTH(SCREEN_WIDTH),
    .SCREEN_HEIGHT(SCREEN_HEIGHT),
    .CLOCK_50(CLOCK_50),
    .left_bottom_magenta(leftmagblack)
);*/

    // Background ROM interface
    wire [2:0] background_color;
    wire [17:0] background_address = VGA_Y * SCREEN_WIDTH + VGA_X;

    background_mem displayBG (
        .address(background_address),
        .clock(CLOCK_50),
        .q(background_color) // Background pixel color
    );

    // Initialize Mario position
    initial begin
        /*mario_x = (SCREEN_WIDTH - MARIO_SIZE) / 2;
        mario_y = (SCREEN_HEIGHT - MARIO_SIZE) / 2;*/
		  mario_x = 35;
		  mario_y = 210;
		  barrel_x = 16;
		  barrel_y = 16;
		  barrel_x2 = -100;
		  barrel_y2 = -100;
		  youwin_x = -50;
		  youwin_y = -50;
        move_counter = 0;
    end
	 
	 reg pressed;
	 reg [7:0] recent;

    // Mario movement logic
    // Mario movement logic with combined received_data_en and move_tick
	reg [7:0] current_key; // Tracks the currently active key
	reg key_released; 

	
	//assign standing_below = (received_data == 8'h1D);
always @(posedge CLOCK_50) begin

	  
	 if (move_tick) begin
		if (~bstanding_below) begin
			barrel_y <= barrel_y + 1;
			
		end
		else if (barrel_x < 294 && (barrel_y < 95 || (barrel_y < 190 && barrel_y > 140)))begin
		
			barrel_x <= barrel_x + 1;//right
		end
		else if (barrel_x > 20 && ((barrel_y > 95 && barrel_y < 140) || (barrel_y > 190))) begin
			barrel_x <= barrel_x - 1;//left
		end
		else if (barrel_x < 40 && barrel_y > 210) begin
			barrel_x <= 16;
			barrel_y <= 16;
	end
	end
		
		
	if (move_tick) begin
		if (barrel_x < 40 && barrel_y == 155) begin
			barrel_x2 <= 16;
			barrel_y2 <= 16;
		end
		if (~bstanding_below2) begin
			barrel_y2 <= barrel_y2 + 1;
			
		end
		else if (barrel_x2 < 294 && (barrel_y2 < 95 || (barrel_y2 < 190 && barrel_y2 > 140)))begin
		
			barrel_x2 <= barrel_x2 + 1;//right
		end
		else if (barrel_x2 > 20 && ((barrel_y2 > 95 && barrel_y2 < 140) || (barrel_y2 > 190))) begin
			barrel_x2 <= barrel_x2 - 1;//left
		end
		else if (barrel_x2 < 40 && barrel_y2 > 210) begin
			barrel_x2 <= 16;
			barrel_y2 <= 16;
	end
	end
	
	
	 prevjump <= jump;
	 if (jumpcheck == 0) jump <= 0;
	 if (~jump) downnow <= 0;
	 
	 //if (~jump && ~standing_below) mario_y <= mario_y + 1;
	 
	 if ((mario_x >= 121 && mario_x <= 126) && mario_y <= 51) begin
		youwin_x = 260;
		youwin_y = 20;
	 
	 end
	 
    if (!resetn || touchingbar || touchingbar2) begin
        /*mario_x <= (SCREEN_WIDTH - MARIO_SIZE) / 2;
        mario_y <= (SCREEN_HEIGHT - MARIO_SIZE) / 2;*/
		  mario_x <= 35;
		  mario_y <= 205;
		  barrel_x <= 16;
		  barrel_y <= 16;
		  barrel_x2 <= -100;
		  barrel_y2 <= -100;
		  youwin_x <= -50;
		  youwin_y <= -50;
        current_key <= 8'h00; // No key pressed
        key_released <= 1'b0;
		  dir <= 2'b00;
		  jump <= 0;
    end else begin
        // Detect keypress or key release
        if (received_data_en) begin
				justmoved <= 0;
            if (received_data == 8'hF0) begin
                key_released <= 1'b1; // Key release detected
            end else if (key_released) begin
                key_released <= 1'b0; // Key has been released, reset the current key
                current_key <= 8'h00;
					 
					 dir <= 2'b00;
            end else begin
                // Update current_key on valid keypress
                case (received_data)
                    8'h1D: begin
								current_key <= 8'h1D; // Up
								
								if (~jump) begin
									ystart <= mario_y;
									lockeddir <= dir;
									mario_y <= mario_y - 3;
									//assign standing_below = 1;
								end
								
								jump <= 1;
								
								
							end
                    8'h1B: current_key <= 8'h1B; // Down
                    8'h1C: begin
							if (jump != 1) 
								current_key <= 8'h1C; // Left
								dir <= 2'b10;
							end
                    8'h23: begin
							if (jump != 1)
								current_key <= 8'h23; // Right
								dir <= 2'b01;
						  end
                    default: begin
								current_key <= 8'h00; // No valid key
								dir <= 2'b00;
						  end
                endcase
					 
            end
        end

        // Move Mario on move_tick based on current_key
        move_counter <= move_counter + 1;
        if (move_tick) begin
		  
		  //assign downnow = 0;
		  if (jump) begin
				// JUMP UP AND DOWN HERE
				if (mario_y < ystart - 30 || standing_above) begin
					downnow <= 1;
				end
				
				if (~downnow)
					mario_y <= mario_y - 1;
				else 
					mario_y <= mario_y + 1;
				
				
				
				if (lockeddir == 2'b10)
					mario_x <= mario_x - 1;
				else if (lockeddir == 2'b01 && mario_x < SCREEN_WIDTH - MARIO_SIZE) 
					mario_x <= mario_x + 1;		 
				
				
				/*if (left_bottom_magenta_detected) begin
                mario_y <= mario_y - 1; // Move Mario upward
            end
					
				
				if (right_bottom_magenta_detected) begin
                mario_y <= mario_y - 1;
            end*/
		  end
		  
		  
		  else begin
		  
		  
		  
				/*if (received_data == 8'h1D && lockeddir == 2'b10) current_key <= 8'h1C;
				else if (received_data == 8'h1D && lockeddir == 2'b01) current_key <= 8'h23;*/
				
				
            case (current_key)
                8'h1D: if (mario_y > 0 && !standing_above_reg) begin
					 //8'h1D: if (mario_y > 0 && !standing_above_reg && cyan_detected_reg) begin
						mario_y <= mario_y - 1; // Up
						jump <= 1;
						if (dir == 2'b10) begin
							mario_x <= mario_x - 1;
							justmoved <= 0;
						end
						else if (dir == 2'b01) begin
							mario_x <= mario_x + 1;
							justmoved <= 0;
							end
						end
                //8'h1B: if (mario_y < SCREEN_HEIGHT - MARIO_SIZE && !standing_below_reg) mario_y <= mario_y + 1; // Down
                8'h1C: if (mario_x > 0 && jump != 1) mario_x <= mario_x - 1; // Left
                8'h23: if (mario_x < SCREEN_WIDTH - MARIO_SIZE && jump != 1) mario_x <= mario_x + 1; // Right
                default: ; // No movement
            endcase
				//if (left_bottom_magenta_detected && current_key == 8'h1C && dir == 2'b10) begin
				if (left_bottom_magenta_detected && standing_below) begin
                mario_y <= mario_y - 1; // Move Mario upward
					 justmoved <= 1;
            end
				//if (right_bottom_magenta_detected && current_key == 8'h23 && dir == 2'b01) begin
				if (right_bottom_magenta_detected && standing_below) begin
                mario_y <= mario_y - 1;
					 justmoved <= 1;
            end
				
				if (~jump && ~standing_below && ~right_bottom_magenta_detected && ~left_bottom_magenta_detected) mario_y <= mario_y + 1;
				
				
				/*if (leftmagblack) begin
                mario_y <= mario_y + 1;
            end*/
        end
    end
	 end
end



    // VGA signal logic
    always @(posedge CLOCK_50) begin
        VGA_X <= h_counter;
        VGA_Y <= v_counter;

        // Increment horizontal counter
        if (h_counter < SCREEN_WIDTH - 1) begin
            h_counter <= h_counter + 1;
        end else begin
            h_counter <= 0;
            // Increment vertical counter at the end of each row
            if (v_counter < SCREEN_HEIGHT - 1)
                v_counter <= v_counter + 1;
            else
                v_counter <= 0; // Restart at the top
        end
    end

    // Color determination logic
    always @(posedge CLOCK_50) begin

            VGA_COLOR <= background_color; // Default to background
       
        if (mario_active) begin
            // Use Mario's sprite color if active
            if (mario_color != 3'b010) begin // Skip green for transparency
                VGA_COLOR <= mario_color;
					 
            end
			end
				
			 else if(barrel_active) begin
				if (barrel_color != 3'b010) begin
				VGA_COLOR <= barrel_color;
				
			end
		end
		else if(barrel_active2) begin
				if (barrel_color2 != 3'b010) begin
				VGA_COLOR <= barrel_color2;
				
			end
		end
		
		else if(youwin_active) begin
				if (youwin_color != 3'b010) begin
				VGA_COLOR <= youwin_color;
				
			end
		end
        
        plot <= 1;
    end

    // VGA adapter instantiation
    vga_adapter VGA (
        .resetn(resetn),
        .clock(CLOCK_50),
        .colour(VGA_COLOR),
        .x(VGA_X),
        .y(VGA_Y),
        .plot(plot),
        .VGA_R(VGA_R),
        .VGA_G(VGA_G),
        .VGA_B(VGA_B),
        .VGA_HS(VGA_HS),
        .VGA_VS(VGA_VS),
        .VGA_BLANK_N(VGA_BLANK_N),
        .VGA_SYNC_N(VGA_SYNC_N),
        .VGA_CLK(VGA_CLK)
    );
    defparam VGA.RESOLUTION = "320x240";
    defparam VGA.MONOCHROME = "FALSE";
    defparam VGA.BITS_PER_COLOUR_CHANNEL = 1;
    defparam VGA.BACKGROUND_IMAGE = "map320.mif";

endmodule

// Module for magenta detection
module touching_magentatop(
    input [8:0] mario_x,
    input [7:0] mario_y,
    input [8:0] SCREEN_WIDTH,
    input [7:0] SCREEN_HEIGHT,
    input CLOCK_50,
    output reg standing_above
);
    parameter MARIO_SIZE = 16;
	 parameter BARREL_SIZE = 12;
    parameter MAGENTA_COLOR = 3'b101;

    reg [17:0] pixel_address;
    wire [2:0] backgroundcolor;
    integer i;

    // Background memory (assumes pixel data is accessible)
    background_mem bg_mem (
        .address(pixel_address),
        .clock(CLOCK_50),
        .q(backgroundcolor)
    );

    always @(posedge CLOCK_50) begin
        standing_above <= 0;
        // Check top row (above Mario's top edge)
        if (mario_y > 1) begin
            for (i = 0; i < MARIO_SIZE; i = i + 1) begin
                if (mario_x + i < SCREEN_WIDTH) begin
                    pixel_address = (mario_y-1) * SCREEN_WIDTH + (mario_x + i);
                    if (backgroundcolor == MAGENTA_COLOR) begin
                        standing_above <= 1;
                    end
                end
            end
        end
end
endmodule


module touching_barrel(
    input [8:0] mario_x,
    input [7:0] mario_y,
	 input [8:0] barrel_x,
	 input [7:0] barrel_y,
    input [8:0] SCREEN_WIDTH,
    input [7:0] SCREEN_HEIGHT,
    input CLOCK_50,
	 
    output reg touching
);
	 
	 parameter MARIO_SIZE = 16;
	
    parameter MAGENTA_COLOR = 3'b101;

    reg [17:0] pixel_address;
    wire [2:0] backgroundcolor;
    integer i;

    // Background memory (assumes pixel data is accessible)
    background_mem bg_mem (
        .address(pixel_address),
        .clock(CLOCK_50),
        .q(backgroundcolor)
    );
	 always @(posedge CLOCK_50) begin
        touching <= 0;
        // Check bottom row (below Mario's bottom edge)
        if (mario_y + MARIO_SIZE < SCREEN_HEIGHT) begin
            for (i = 0; i < MARIO_SIZE; i = i + 1) begin
                if (mario_x + i < SCREEN_WIDTH) begin
					 if (
					 mario_x >= barrel_x && mario_x <= (barrel_x + 12) && mario_y <= (barrel_y +8) && (mario_y >= barrel_y)
						|| mario_x + MARIO_SIZE >= barrel_x && mario_x + MARIO_SIZE <= (barrel_x + 12) && mario_y <= (barrel_y +8) && (mario_y >= barrel_y)
						 || mario_x >= barrel_x && mario_x <= (barrel_x + 12) && mario_y + MARIO_SIZE <= (barrel_y +8) && (mario_y + MARIO_SIZE >= barrel_y)
						 || mario_x + MARIO_SIZE >= barrel_x && mario_x + MARIO_SIZE<= (barrel_x + 12) && mario_y + MARIO_SIZE <= (barrel_y +8) && (mario_y + MARIO_SIZE >= barrel_y)
						 || mario_x + MARIO_SIZE/2 >= barrel_x && mario_x + MARIO_SIZE/2 <= (barrel_x + 12) && mario_y + MARIO_SIZE/2 <= (barrel_y +8) && (mario_y + MARIO_SIZE/2 >= barrel_y))
                    //pixel_address = (mario_y + MARIO_SIZE + 6) * SCREEN_WIDTH + (mario_x + i);
                    
                        touching <= 1;
								
                    
                end
            end
        end
    end
endmodule



module touching_magenta(
    input [8:0] mario_x,
    input [7:0] mario_y,
    input [8:0] SCREEN_WIDTH,
    input [7:0] SCREEN_HEIGHT,
    input CLOCK_50,
	 input size,
    output reg standing_below,
	 output reg jump
);
	 
	 parameter MARIO_SIZE = 16;
	
    parameter MAGENTA_COLOR = 3'b101;

    reg [17:0] pixel_address;
    wire [2:0] backgroundcolor;
    integer i;

    // Background memory (assumes pixel data is accessible)
    background_mem bg_mem (
        .address(pixel_address),
        .clock(CLOCK_50),
        .q(backgroundcolor)
    );
	 always @(posedge CLOCK_50) begin
        standing_below <= 0;
        // Check bottom row (below Mario's bottom edge)
        if (mario_y + MARIO_SIZE < SCREEN_HEIGHT) begin
            for (i = 0; i < MARIO_SIZE; i = i + 1) begin
                if (mario_x + i < SCREEN_WIDTH) begin
                    pixel_address = (mario_y + MARIO_SIZE) * SCREEN_WIDTH + (mario_x + i);
                    if (backgroundcolor == MAGENTA_COLOR) begin
                        standing_below <= 1;
								jump <= 0;
                    end
						  else begin
								jump <= 1;
						  end
                end
            end
        end
    end
endmodule

module touching_magenta1(
    input [8:0] mario_x,
    input [7:0] mario_y,
    input [8:0] SCREEN_WIDTH,
    input [7:0] SCREEN_HEIGHT,
    input CLOCK_50,
	 input size,
    output reg standing_below,
	 output reg jump
);
	 
	 parameter MARIO_SIZE = 12;
	
    parameter MAGENTA_COLOR = 3'b101;

    reg [17:0] pixel_address;
    wire [2:0] backgroundcolor;
    integer i;

    // Background memory (assumes pixel data is accessible)
    background_mem bg_mem (
        .address(pixel_address),
        .clock(CLOCK_50),
        .q(backgroundcolor)
    );
	 always @(posedge CLOCK_50) begin
        standing_below <= 0;
        // Check bottom row (below Mario's bottom edge)
        if (mario_y + MARIO_SIZE < SCREEN_HEIGHT) begin
            for (i = 0; i < MARIO_SIZE; i = i + 1) begin
                if (mario_x + i < SCREEN_WIDTH) begin
                    pixel_address = (mario_y + MARIO_SIZE ) * SCREEN_WIDTH + (mario_x + i);
                    if (backgroundcolor == MAGENTA_COLOR) begin
                        standing_below <= 1;
								jump <= 0;
                    end
						  else begin
								jump <= 1;
						  end
                end
            end
        end
    end
endmodule

module touching_cyan(
    input [8:0] mario_x,         // Mario's top-left X coordinate
    input [7:0] mario_y,         // Mario's top-left Y coordinate
    input [8:0] SCREEN_WIDTH,    // Screen width
    input [7:0] SCREEN_HEIGHT,   // Screen height
    input CLOCK_50,              // Clock input
    output reg cyan              // Output: 1 if more than 8 cyan pixels are detected
);
    parameter MARIO_SIZE = 16;   // Mario's size (16x16 pixels)
    parameter CYAN_COLOR = 3'b011; // Cyan color in 3-bit RGB format

    reg [17:0] pixel_address;   // Address for the background memory
    wire [2:0] backgroundcolor; // Pixel color from the background memory
    reg [4:0] cyan_count;       // Counter for cyan pixels (5 bits to count up to 16)
    integer i, j;               // Loop variables for 16x16 traversal
    background_mem bg_mem (
        .address(pixel_address),
        .clock(CLOCK_50),
        .q(backgroundcolor)
    );

    always @(posedge CLOCK_50) begin
        cyan <= 0;
        cyan_count <= 0;

        // Check each pixel in Mario's 16x16 area
        for (i = 0; i < MARIO_SIZE; i = i + 1) begin
            for (j = 0; j < MARIO_SIZE; j = j + 1) begin
                if ((mario_x + j < SCREEN_WIDTH) && (mario_y + i < SCREEN_HEIGHT)) begin
                    pixel_address = (mario_y + i) * SCREEN_WIDTH + (mario_x + j);
                    if (backgroundcolor == CYAN_COLOR) begin
                        cyan_count <= cyan_count + 1;
                    end
                end
            end
        end

        // Set cyan output if more than 8 pixels are cyan
        if (cyan_count > 8) begin
            cyan <= 1;
        end else begin
            cyan <= 0;
        end
    end
endmodule

module touching_left_bottom_magenta(
    input [8:0] mario_x,         // Mario's top-left X coordinate
    input [7:0] mario_y,         // Mario's top-left Y coordinate
    input [8:0] SCREEN_WIDTH,    // Screen width
    input [7:0] SCREEN_HEIGHT,   // Screen height
    input CLOCK_50,              // Clock input
    output reg left_bottom_magenta // Output: 1 if left-bottom pixel is magenta
);
    parameter MARIO_SIZE = 16;   // Mario's size (16x16 pixels)
    parameter MAGENTA_COLOR = 3'b101; // Magenta color in 3-bit RGB format

    reg [17:0] pixel_address;   // Address for the background memory
    wire [2:0] backgroundcolor; // Pixel color from the background memory

    background_mem bg_mem (
        .address(pixel_address),
        .clock(CLOCK_50),
        .q(backgroundcolor)
    );

    always @(posedge CLOCK_50) begin
        left_bottom_magenta <= 0;

        // Check left-bottom pixel of Mario
        if ((mario_x < SCREEN_WIDTH) && (mario_y + MARIO_SIZE - 1 < SCREEN_HEIGHT)) begin
            pixel_address = (mario_y + MARIO_SIZE - 1) * SCREEN_WIDTH + mario_x;
            if (backgroundcolor == MAGENTA_COLOR) begin
                left_bottom_magenta <= 1;
            end
        end
    end
endmodule


module touching_right_bottom_magenta(
    input [8:0] mario_x,         // Mario's top-left X coordinate
    input [7:0] mario_y,         // Mario's top-left Y coordinate
    input [8:0] SCREEN_WIDTH,    // Screen width
    input [7:0] SCREEN_HEIGHT,   // Screen height
    input CLOCK_50,              // Clock input
    output reg right_bottom_magenta // Output: 1 if left-bottom pixel is magenta
);
    parameter MARIO_SIZE = 16;
    parameter MAGENTA_COLOR = 3'b101; // Magenta color in 3-bit RGB format

    reg [17:0] pixel_address;   // Address for the background memory
    wire [2:0] backgroundcolor; // Pixel color from the background memory

    background_mem bg_mem (
        .address(pixel_address),
        .clock(CLOCK_50),
        .q(backgroundcolor)
    );

    always @(posedge CLOCK_50) begin
        right_bottom_magenta <= 0;
        if ((mario_x < SCREEN_WIDTH) && (mario_y + MARIO_SIZE - 1 < SCREEN_HEIGHT)) begin
            pixel_address = (mario_y + MARIO_SIZE - 1) * SCREEN_WIDTH + mario_x + MARIO_SIZE;
            if (backgroundcolor == MAGENTA_COLOR) begin
                right_bottom_magenta <= 1;
            end
        end
    end
endmodule






/*module left_magentathenblack(
    input [8:0] mario_x,         // Mario's top-left X coordinate
    input [7:0] mario_y,         // Mario's top-left Y coordinate
    input [8:0] SCREEN_WIDTH,    // Screen width
    input [7:0] SCREEN_HEIGHT,   // Screen height
    input CLOCK_50,              // Clock input
    output reg left_bottom_magenta // Output: 1 if left-bottom pixel is magenta
);
    parameter MARIO_SIZE = 16;   // Mario's size (16x16 pixels)
    parameter MAGENTA_COLOR = 3'b101; // Magenta color in 3-bit RGB format
    parameter BLACK_COLOR = 3'b000;
    reg [17:0] pixel_address;   // Address for the background memory
	 reg [17:0] nextpixel_address;
    wire [2:0] backgroundcolor; // Pixel color from the background memory
	 wire [2:0] next_backgroundcolor;

    background_mem bg_mem (
        .address(pixel_address),
        .clock(CLOCK_50),
        .q(backgroundcolor)
    );
	 background_mem bg_mem2 (
        .address(nextpixel_address),
        .clock(CLOCK_50),
        .q(nextbackgroundcolor)
    );

    always @(posedge CLOCK_50) begin
        left_bottom_magenta <= 0;

        // Check left-bottom pixel of Mario
        if ((mario_x < SCREEN_WIDTH) && (mario_y + MARIO_SIZE - 1 < SCREEN_HEIGHT)) begin
            pixel_address = (mario_y + MARIO_SIZE - 1 + 1) * SCREEN_WIDTH + mario_x;
				nextpixel_address = (mario_y + MARIO_SIZE - 1 + 1) * SCREEN_WIDTH + mario_x - 1;
				//nextpixel_address = (mario_y + MARIO_SIZE - 1 + 1) * SCREEN_WIDTH + mario_x-1;
            if (backgroundcolor == MAGENTA_COLOR && nextbackgroundcolor == BLACK_COLOR) begin
                left_bottom_magenta <= 1;
            end
        end
    end
endmodule*/






module regn #(parameter n = 8) (
    input [n-1:0] R,
    input Resetn,
    input E,
    input Clock,
    output reg [n-1:0] Q
);

    always @(posedge Clock)
        if (!Resetn)
            Q <= 0;
        else if (E)
            Q <= R;

endmodule

module count #(parameter n = 8) (
    input Clock,
    input Resetn,
    input E,
    output reg [n-1:0] Q
);

    always @(posedge Clock)
        if (!Resetn)
            Q <= 0;
        else if (E)
            Q <= Q + 1;

endmodule

module hex7seg (
    input [3:0] hex,
    output reg [6:0] display
);

    /*
     *       0  
     *      ---  
     *     |   |
     *    5|   |1
     *     | 6 |
     *      ---  
     *     |   |
     *    4|   |2
     *     |   |
     *      ---  
     *       3  
     */
    always @ (hex)
        case (hex)
            4'h0: display = 7'b1000000;
            4'h1: display = 7'b1111001;
            4'h2: display = 7'b0100100;
            4'h3: display = 7'b0110000;
            4'h4: display = 7'b0011001;
            4'h5: display = 7'b0010010;
            4'h6: display = 7'b0000010;
            4'h7: display = 7'b1111000;
            4'h8: display = 7'b0000000;
            4'h9: display = 7'b0011000;
            4'hA: display = 7'b0001000;
            4'hB: display = 7'b0000011;
            4'hC: display = 7'b1000110;
            4'hD: display = 7'b0100001;
            4'hE: display = 7'b0000110;
            4'hF: display = 7'b0001110;
        endcase

endmodule