int osc[4] = {0, 0, 0, 0};
int aVal[4] = {0, 0, 0, 0};
int lastAVal[4] = {-1, -1, -1, -1};
int prong = 0;
int lastProng = -1;

#define REG_COUNT 3
int reg[REG_COUNT][4] = {
    {0, 1023, 500, 500},
    {1023, 0, 600, 400},
    {511, 127, 400, 600}
};
int regIndex = 0;
int nextRegIndex = 1;

bool prongMode = false;
bool pingPong = true;

void setup() {
    Serial.begin(9600);
}

void loop() {
// Handle the big knob first...
    prong = analogRead(A0);

// If there's movement on the big knob, set prongMode to true.
    if(lastProng >= 0) {
        if(abs(prong - lastProng) >= 3) {
            prongMode = true;
        }
    }
    lastProng = prong;

    aVal[0] = analogRead(A1);
    aVal[1] = analogRead(A2);
    aVal[2] = analogRead(A3);
    aVal[3] = analogRead(A4);
    if(lastAVal[0] >= 0) {
        for(int i = 0; i < 3; i++) {
            if(abs(aVal[i] - lastAVal[i]) >= 3) {
                prongMode = false;
            }
        }
    }

// In prongMode, the values of the other 4 knobs are loaded from the registers.
// When not in prongMode, their values are loaded from the analogue values.
    if(prongMode) {
        nextRegIndex = regIndex + 1;
        if(nextRegIndex >= REG_COUNT) {
            nextRegIndex = 0;
        }
        
        for(int i = 0; i < 4; i++) {
            int from = pingPong ? reg[regIndex][i] : reg[nextRegIndex][i];
            int to = pingPong ? reg[nextRegIndex][i] : reg[regIndex][i];
            
            osc[i] = mix(
                prong,
                1023, 
                from, 
                to
            );            
        }
    }
    else {
        for(int i = 0; i < 3; i++) {
            osc[i] = aVal[i];
        }
    }
    
    Serial.print("P:");
    Serial.print(prong);
    Serial.print("\t0:");
    Serial.print(osc[0]);
    Serial.print("\t1:");
    Serial.print(osc[1]);
    Serial.print("\t2:");
    Serial.print(osc[2]);
    Serial.print("\t3:");
    Serial.print(osc[3]);
    
    if(pingPong) {
        Serial.print("\tPING");
    
        if(prong >= 1023) {
            pingPong = false;
            regIndex = nextRegIndex;
        }
    }
    else {
        Serial.print("\tPONG");
        
        if(prong <= 0) {
            pingPong = true;
            regIndex = nextRegIndex;
        }
    }

    Serial.print("\tR:");
    Serial.print(regIndex);

    Serial.println();
    delay(1);
}

int mix(int amount, float amountScale, int from, int to) {
    float scalar = amount / amountScale;
    return from + scalar * (to - from);
}
