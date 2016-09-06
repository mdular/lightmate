
//#include <Wire.h>
#include <avr/pgmspace.h>


/*******************************************
define the data zone
*******************************************/

//Test dots
//unsigned char Tdots[8][8][3]=     {{{0,0,255},     {0,0,255},      {0,0,255},     {0,0,255},    {0,0,255},      {0,0,255},       {0,0,255},        {0,0,255}},
//                                  {{0,165,255},   {0,165,255},    {0,165,255},   {0,165,255},  {0,165,255},    {0,165,255},     {0,165,255},      {0,165,255}},
//                                  {{0,255,255},   {0,255,255},    {0,255,255},   {0,255,255},  {0,255,255},    {0,255,255},     {0,255,255},      {0,255,255}},
//                                  {{0,255,0},     {0,255,0},      {0,255,0},     {0,255,0},    {0,255,0},      {0,255,0},       {0,255,0},        {0,255,0}},
//                                  {{255,127,0},   {255,127,0},    {255,127,0},   {255,127,0},  {255,127,0},    {255,127,0},     {255,127,0},      {255,127,0}},
//                                  {{255,0,0},     {255,0,0},      {255,0,0},     {255,0,0},    {255,0,0},      {255,0,0},       {255,0,0},        {255,0,0}},
//                                  {{255,0,139},   {255,0,139},    {255,0,139},   {255,0,139},  {255,0,139},    {255,0,139},     {255,0,139},      {255,0,139}},
//                                  {{255,255,255}, {255,255,255},  {255,255,255}, {255,255,255},{255,255,255},  {255,255,255},   {255,255,255},    {255,255,255}}
//                                 };

unsigned char dots[2][8][8][3] = {0};
//dots matrix
//[2]:Page:one for display, one for receive data
//[8]:Row:8 row in LED plane
//[8]:Column:8 column in one row
//[3]:Color:RGB data: 0 for Red; 1 for green, 2 for Blue
unsigned char Gamma_Value[3] = {41,63,55};
//Gamma correctly value, every LED plane is different.value range is 0~63
//[3]:RGB data, 0 for Red; 1 for green, 2 for Blue
unsigned char Page_Index = 0; // the index of buffer
unsigned char row = 0;//the value of row in LED plane, from 0~7
unsigned char column = 0;//the value of every row, from 0~7
unsigned char color = 0;//the value of every dots, 0 is Red, 1 is Green, 2 is Blue

unsigned char line = 0;


#define DELIMITING_CYCLES 1000

/**************************************************
define the extern data zone
**************************************************/
extern unsigned char font8_8[92][8];
extern unsigned char pic[4][8][8][3];


/****************************************************
Main Functions zone
****************************************************/
void setup()
{
  Serial.begin(9600);
  
  _IO_Init();           //Init IO
  _LED_Init();          //Init LED Hardware
  _TC2_Init();          //Init Timer/Count2

//  DispShowPic(0);
//  delay(1000);

    // RGB test
//  DispShowColor(255, 0, 0);
//  delay(1000);
//  DispShowColor(0, 255, 0);
//  delay(1000);
//  DispShowColor(0, 0, 255);
//  delay(1000);
  DispShowColor(0, 0, 0);
}

// TODO: receive byte values instead (currently assuming ascii chars are sent, interpreted as hex)
// desired layout: [command byte][data byte 1 (red)][data byte 2 (green)][data byte 3 (blue)] {delimiting byte - triggers processing}
// current layout: [red hex byte 1][red hex byte 2][green hex byte 1][green hex byte 2][blue hex byte 1][blue hex byte 2]
char val[7];
byte valIndex = 0;
int lastInput = 0;
boolean received = false;

byte inputCount = 0;
byte currentIndex = 0;
byte currentRow = 7;
byte currentCol = 0;
byte currentColor = 0;

void loop()
{
  while (Serial.available()) {
    char incomingByte = Serial.read();
    lastInput = 0;

    // buffer only the first 6 bytes
    if (valIndex < 6 && incomingByte != '\n') {
      val[valIndex] = incomingByte;
      valIndex++;
    }

    // delimit & process if terminated by line feed
    if (incomingByte == '\n') {
      lastInput = DELIMITING_CYCLES + 1;
      received = true;
      val[6] = '\0'; // null-terminate char array
      return;
    }
  }

  if (valIndex > 0 && lastInput > DELIMITING_CYCLES) {
    // TODO: handle packet failure
  }

  // TODO: process full RGB int
  if (received) {
//    Serial.println(val);
//    Serial.println(hexToByte(val[0]));  // r
//    Serial.println(hexToByte(val[1]));  // r
//    Serial.println(hexToByte(val[2]));  // g
//    Serial.println(hexToByte(val[3]));  // g
//    Serial.println(hexToByte(val[4]));  // b
//    Serial.println(hexToByte(val[5]));  // b
    
    byte redByte = hexToByte(val[0]) << 4;
    redByte += hexToByte(val[1]);
//    Serial.println(redByte, DEC);

    byte greenByte = hexToByte(val[2]) << 4;
    greenByte += hexToByte(val[3]);
//    Serial.println(greenByte, DEC);

    byte blueByte = hexToByte(val[4]) << 4;
    blueByte += hexToByte(val[5]);
//    Serial.println(blueByte, DEC);
    
    val[0] = 0;
    val[1] = 0;
    val[2] = 0;
    val[3] = 0;
    val[4] = 0;
    val[5] = 0;
    received = false;
    valIndex = 0;

//    DispShowChar(val.charAt(0),0,255,0,0);

    // process pixel
//    if (currentColor > 2) {
//      currentColor = 0;
//      currentCol++;
//    }

    // shift row
    if (currentCol > 7) {
      currentCol = 0;
      currentRow--;
    }

    // shift row
    if (currentRow < 0) {
      currentRow = 7;
    }

    // determine write buffer
    if (Page_Index == 0) {
      currentIndex = 1;
    } else if (Page_Index == 1) {
      currentIndex = 0;
    }

    // write to buffer
    dots[currentIndex][currentRow][currentCol][0] = redByte;
    dots[currentIndex][currentRow][currentCol][1] = greenByte;
    dots[currentIndex][currentRow][currentCol][2] = blueByte;

    // move on to the next color
//    currentColor++;

    // move on the the next pixel
    currentCol++;

    // keep track of received pixels
    inputCount++;

    // draw when frame is complete
    if (inputCount >= 64) {
        Serial.println("frame complete");

        // switch active buffer page - draw!
        Page_Index = currentIndex;

        // TODO: save to EEPROM to redraw after reset
 
        inputCount = 0;
        currentColor = 0;
        currentCol = 0;
        currentRow = 7;
    }
  }

  lastInput++;
}

byte hexToByte (char c) {
  if ( (c >= '0') && (c <= '9') ) {
    return c - '0';
  }
  if ( (c >= 'A') && (c <= 'F') ) {
    return (c - 'A') + 10;
  }
}

void DispDrawPic(unsigned char pixels[8][8][3]) {
  unsigned char Page_Write, i, j;

  if (Page_Index == 0) {
    Page_Write = 1;
  } 
  if (Page_Index == 1) {
    Page_Write = 0;
  }

  for (i = 0; i < 8; i++) {
    for (j = 0; j < 8; j++) {
      dots[Page_Write][i][j][0] = pixels[i][j][0];
      dots[Page_Write][i][j][1] = pixels[i][j][1];
      dots[Page_Write][i][j][2] = pixels[i][j][2];
    }
  }

  Page_Index = Page_Write;
}










//void writeEEPROMPic() {
//  // TODO: implement EEPROM write
//}

/********************************************************
Name:DispDrawwPic
Function:Fill a picture in LED matrix from EEPROM
Parameter:Index:the index of picture in EEPROM
********************************************************/
//void DispShowEEPROMPic(unsigned char Index)
//{
//  unsigned char Page_Write,i,j;
//  
//  if(Page_Index == 0)
//    Page_Write = 1;
//  if(Page_Index == 1)
//    Page_Write = 0;
//    
//  for (i = 0;i<8;i++)
//  {
//    
//    for(j = 0;j<8;j++)
//    {
//
//      // TODO: implement eeprom read
//      
////      dots[Page_Write][i][j][0] = pgm_read_byte(&(pic[Index][i][j][2]));
////      dots[Page_Write][i][j][1] = pgm_read_byte(&(pic[Index][i][j][1]));
////      dots[Page_Write][i][j][2] = pgm_read_byte(&(pic[Index][i][j][0]));
//    }
//  }
//  Page_Index = Page_Write;
//  
//}

void printPic(unsigned int index) {  
  unsigned int i, j;
  unsigned char pixels[8][8][3];

  // iterate over rows
  for (i = 0; i < 8; i++) {
    
    // iterate over colums
    for (j = 0; j < 8; j++) {
        pixels[i][j][0] = pgm_read_byte(&(pic[index][i][j][0]));
        pixels[i][j][1] = pgm_read_byte(&(pic[index][i][j][1]));
        pixels[i][j][2] = pgm_read_byte(&(pic[index][i][j][2]));
    }
  }
  printPicArray(pixels);
}

void printPicArray(unsigned char pixels[8][8][3]) {
  unsigned int i, j;

  // iterate over rows
  for (i = 0; i < 8; i++) {
    // iterate over colums
    for (j = 0; j < 8; j++) {
        if (pixels[i][j][0] < 16) {
          Serial.print("0");
        }
        Serial.print(pixels[i][j][0], HEX);
//        Serial.print(",");
        if (pixels[i][j][1] < 16) {
          Serial.print("0");
        }
        Serial.print(pixels[i][j][1], HEX);
//        Serial.print(",");
        if (pixels[i][j][2] < 16) {
          Serial.print("0");
        }
        Serial.print(pixels[i][j][2], HEX);
        Serial.print(",");
    }
    Serial.println();
  }
}

/*****************************
define the operate commands
*****************************/

/*****************************
define the status
*****************************/

/*****************************
define the IO
*****************************/
#define RST_BIT 0x04
#define LAT_BIT 0x02
#define SLB_BIT 0x01
#define SCL_BIT 0x40
#define SDA_BIT 0x80

#define RST PORTC
#define LAT PORTC
#define SLB PORTC
#define SDA PORTD
#define SCL PORTD

#define open_line0  {PORTB=0x01;}
#define open_line1  {PORTB=0x02;}
#define open_line2  {PORTB=0x04;}
#define open_line3  {PORTB=0x08;}
#define open_line4  {PORTB=0x10;}
#define open_line5  {PORTB=0x20;}
#define open_line6  {PORTD=0x08;}
#define open_line7  {PORTD=0x10;}
#define close_all_line  {PORTD=0x00;PORTB=0x00;}

/***************************************************
all parts inition functions zone
***************************************************/
void _IO_Init()
{
  DDRD = 0xff; // set all pins direction of PortD
  DDRC = 0xff; // set all pins direction of PortC
  DDRB = 0xff; // set all pins direction of PortB
  
  PORTD = 0x00; // set all pins output is low of PortD
  PORTC = 0x00; // set all pins output is low of PortC
  PORTB = 0x00; // set all pins output is low of PortB
}
void _LED_Init()
{
  LED_RST(1);
  LED_Delay(1);
  LED_RST(0);
  LED_Delay(1);
  LED_RST(1);
  LED_Delay(1);
  
  SetGamma();
  line = 0;
  
}
void _TC2_Init()
{
  TCCR2A |= (1 << WGM21) | (1 << WGM20);   
  TCCR2B |= ((1<<CS22)|(1<<CS20));   // by clk/64
  TCCR2B &= ~((1<<CS21));   // by clk/64
  TCCR2A &= ~((1<<WGM21) | (1<<WGM20));   // Use normal mode
  ASSR |= (1<<AS2);       // Use internal clock - external clock not used in Arduino
  TIMSK2 |= (1<<TOIE2) | (0<<OCIE2B);   //Timer2 Overflow Interrupt Enable
  TCNT2 = 0xff;
  sei();
}


/****************************************************
the timer2 operate functions zone
****************************************************/
ISR(TIMER2_OVF_vect)          //Timer2  Service 
{ 
  cli();  
  TCNT2 = 0x64;      //flash a led matrix frequency is 100.3Hz,period is 9.97ms
  //TCNT2 = 0x63;      //flash a led matrix frequency is 99.66Hz,period is 10.034ms   
    if(line > 7) line = 0;    
    close_all_line;  
    run(line);
    open_line(line);
    line++;
    sei();
}
/****************************************************
the LED Hardware operate functions zone
****************************************************/
void LED_SDA(unsigned char temp)
{
  if (temp) 
    SDA|=SDA_BIT;
  else
    SDA&=~SDA_BIT;
}

void LED_SCL(unsigned char temp)
{
  if (temp) 
    SCL|=SCL_BIT;
  else
    SCL&=~SCL_BIT;
}

void LED_RST(unsigned char temp)
{
  if (temp) 
    RST|=RST_BIT;
  else
    RST&=~RST_BIT;
}

void LED_LAT(unsigned char temp)
{
  if (temp) 
    LAT|=LAT_BIT;
  else
    LAT&=~LAT_BIT;
}

void LED_SLB(unsigned char temp)
{
  if (temp) 
    SLB|=SLB_BIT;
  else
    SLB&=~SLB_BIT;
}
/***************************************************
the LED datas operate functions zone
***************************************************/
void SetGamma()
{
  unsigned char i = 0;
  unsigned char j = 0;
  unsigned char k = 0;
  unsigned char temp = 0;
  LED_LAT(0);
  LED_SLB(0);
  for(k=0;k<8;k++)
    for(i = 3;i > 0 ;i--)
    {
      temp = Gamma_Value[i-1]<<2;
      for(j = 0;j<6;j++)
      {
        if(temp &0x80)
          LED_SDA(1);
        else
          LED_SDA(0);
        
        temp =temp << 1;
        LED_SCL(0);
        LED_SCL(1);
    }
  }
  LED_SLB(1);
}
void run(unsigned char k)
{
  unsigned char i = 0;
  unsigned char j = 0;
  unsigned char p = 0;
  unsigned char temp = 0;
  LED_SLB(1);
  LED_LAT(0);
  for(i = 0;i<8;i++)
  {
    
    for(j=0;j<3;j++)
    {
      temp = dots[Page_Index][k][i][2-j];
      for(p=0;p<8;p++)
      {
         if(temp & 0x80)
           LED_SDA(1);
         else
           LED_SDA(0);
           
         temp = temp<<1;  
         LED_SCL(0);
         LED_SCL(1);
       }
     }
  }
  LED_LAT(1);
  LED_LAT(0);
}
void open_line(unsigned char x)
{
  switch (x)
  {  
    case 0 :open_line0;
            break;
    case 1 :open_line1;
            break;
    case 2 :open_line2;
            break;
    case 3 :open_line3;
            break;
    case 4 :open_line4;
            break;
    case 5 :open_line5;
            break;
    case 6 :open_line6;
            break;
    case 7 :open_line7;
            break;
    default: close_all_line;
            break;
  }
}
/********************************************************
Name:DispShowChar
Function:Display a English latter in LED matrix
Parameter:chr :the latter want to show
          R: the value of RED.   Range:RED 0~255
          G: the value of GREEN. Range:RED 0~255
          B: the value of BLUE.  Range:RED 0~255
          bias: the bias of a letter in LED Matrix.Range -7~7
********************************************************/
void DispShowChar(char chr,unsigned char R,unsigned char G,unsigned char B,char bias)
{
  unsigned char i,j,Page_Write,temp;
  unsigned char Char;
  unsigned char chrtemp[24] = {0};
  
  if ((bias > 8) || (bias < -8))
    return;
    
  
  Char = chr - 32;
  
  if(Page_Index == 0)
    Page_Write = 1;
  if(Page_Index == 1)
    Page_Write = 0;
  j = 8 - bias;
  for(i = 0;i< 8;i++)
  {
    chrtemp[j] = pgm_read_byte(&(font8_8[Char][i]));    
    j++;
  }  
  for(i = 0;i < 8;i++)
  {
    
    temp = chrtemp[i+8];
    for(j = 0;j < 8;j++)
    {
      if(temp & 0x80)
      {
        dots[Page_Write][j][i][0] = B;
        dots[Page_Write][j][i][1] = G;
        dots[Page_Write][j][i][2] = R;
      }
      else
      {
        dots[Page_Write][j][i][0] = 0;
        dots[Page_Write][j][i][1] = 0;
        dots[Page_Write][j][i][2] = 0;
      }
      temp = temp << 1;
    }
  }
  Page_Index = Page_Write;  
}
/********************************************************
Name:DispShowColor
Function:Fill a color in LED matrix
Parameter:R: the value of RED.   Range:RED 0~255
          G: the value of GREEN. Range:RED 0~255
          B: the value of BLUE.  Range:RED 0~255
********************************************************/
void DispShowColor(unsigned char R,unsigned char G,unsigned char B)
{
  unsigned char Page_Write,i,j;
  
  if(Page_Index == 0)
    Page_Write = 1;
  if(Page_Index == 1)
    Page_Write = 0;
    
  for (i = 0;i<8;i++)
    for(j = 0;j<8;j++)
    {
      dots[Page_Write][i][j][2] = R;
      dots[Page_Write][i][j][1] = G;
      dots[Page_Write][i][j][0] = B;
    }
  
  Page_Index = Page_Write;
}
/********************************************************
Name:DispShowPic
Function:Fill a picture in LED matrix from FLASH
Parameter:Index:the index of picture in Flash.
********************************************************/
void DispShowPic(unsigned char Index)
{
  unsigned char Page_Write,i,j;
  
  if(Page_Index == 0)
    Page_Write = 1;
  if(Page_Index == 1)
    Page_Write = 0;
    
  for (i = 0;i<8;i++)
  {
    
    for(j = 0;j<8;j++)
    {
      
      dots[Page_Write][i][j][0] = pgm_read_byte(&(pic[Index][i][j][2]));
      dots[Page_Write][i][j][1] = pgm_read_byte(&(pic[Index][i][j][1]));
      dots[Page_Write][i][j][2] = pgm_read_byte(&(pic[Index][i][j][0]));
    }
  }
  Page_Index = Page_Write;
  
}

/******************************************
the other operate functions zone
******************************************/
void LED_Delay(unsigned char i)
{
  unsigned int y;
  y = i * 10;
  while(y--);
}

