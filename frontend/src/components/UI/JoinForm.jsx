import { Navigate, redirect, useNavigate } from 'react-router-dom';
import { Box, Button, CardActionArea, CardActions, CardContent, Input, Typography,Card, CardMedia } from '@mui/material';

export default function({handleJoin, setRoomId, roomId}){
    return (
        <>
          <div className="animated-bg"></div>
            <Card className="card-container" sx={{ maxWidth: 400 }}>

                <CardActionArea>
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="div" align="center" sx={{ fontSize: 45 }}>
                            Join a Game
                        </Typography>
                    </CardContent>
                </CardActionArea>
                <CardMedia
                    component="img"
                    height="194"
                    image="/logo.png"
                    alt="Logo"
                />
                <CardActions>
                    <Box
                        component="form"
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        width="100%"
                    >
                        <Input
                            value={roomId}
                            placeholder="Enter Room ID"
                            type="text"
                            onChange={(e) => setRoomId(e.target.value)}
                            sx={{
                                marginTop: 2,
                                marginBottom: 2,
                                width: '100%',
                                backgroundColor: 'white',
                                borderRadius: 1,
                                padding: '10px'
                            }}
                        />
                        <Button
                            variant="contained"
                            color="success"
                            sx={{
                                margin: 1,
                                width: 150,
                                height: 50,
                                fontSize: 20,
                                backgroundColor: '#006400'
                            }}
                            onClick={handleJoin}
                        >
                            Join
                        </Button>
                    </Box>
                </CardActions>
            </Card>
        </>
    )
}