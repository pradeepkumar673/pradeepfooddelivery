import User from "./models/user.model.js";

export const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('✅ New client connected:', socket.id);

    // Handle user identity
    socket.on('identity', async ({ userId }) => {
      try {
        if (!userId) {
          console.log('❌ No userId provided in identity event');
          socket.emit('identity_error', { message: 'User ID is required' });
          return;
        }

        const user = await User.findByIdAndUpdate(userId, {
          socketId: socket.id,
          isOnline: true,
          lastSeen: new Date()
        }, { new: true });

        console.log(`👤 User ${userId} identified with socket ${socket.id}`);
        
        // Acknowledge successful identity
        socket.emit('identity_ack', { 
          success: true, 
          user: {
            id: user._id,
            name: user.name,
            isOnline: user.isOnline
          }
        });

      } catch (error) {
        console.log('❌ Identity error:', error.message);
        socket.emit('identity_error', { 
          message: 'Failed to identify user',
          error: error.message 
        });
      }
    });

    // Handle location updates
    socket.on('updateLocation', async ({ latitude, longitude, userId }) => {
      try {
        if (!userId || latitude === undefined || longitude === undefined) {
          console.log('❌ Missing data in updateLocation');
          return;
        }

        const user = await User.findByIdAndUpdate(userId, {
          location: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          isOnline: true,
          socketId: socket.id,
          lastLocationUpdate: new Date()
        }, { new: true });

        if (user) {
          // Broadcast to all connected clients except the sender
          socket.broadcast.emit('updateDeliveryLocation', {
            deliveryBoyId: userId,
            latitude,
            longitude,
            timestamp: new Date().toISOString()
          });
          
          console.log(`📍 Location updated for user ${userId}`);
        }

      } catch (error) {
        console.log('❌ updateLocation error:', error.message);
        socket.emit('location_update_error', { 
          message: 'Failed to update location',
          error: error.message 
        });
      }
    });

    // Handle disconnect
    socket.on('disconnect', async (reason) => {
      try {
        console.log(`❌ Client disconnected: ${socket.id}`, reason);

        const updatedUser = await User.findOneAndUpdate(
          { socketId: socket.id }, 
          {
            socketId: null,
            isOnline: false,
            lastSeen: new Date()
          },
          { new: true }
        );

        if (updatedUser) {
          console.log(`👤 User ${updatedUser._id} marked as offline`);
          
          // Notify other clients that this user went offline
          socket.broadcast.emit('user_offline', {
            userId: updatedUser._id,
            lastSeen: new Date()
          });
        }

      } catch (error) {
        console.log('❌ Disconnect error:', error.message);
      }
    });

    // Handle connection errors
    socket.on('connect_error', (error) => {
      console.log('❌ Socket connection error:', error.message);
    });

    // Handle ping/pong for connection health
    socket.on('ping', (data) => {
      socket.emit('pong', { ...data, timestamp: new Date().toISOString() });
    });

    // Optional: Handle manual logout
    socket.on('manual_disconnect', async (userId) => {
      try {
        if (userId) {
          await User.findByIdAndUpdate(userId, {
            socketId: null,
            isOnline: false,
            lastSeen: new Date()
          });
          
          console.log(`👤 User ${userId} manually disconnected`);
        }
        
        socket.disconnect();
      } catch (error) {
        console.log('❌ Manual disconnect error:', error.message);
      }
    });
  });

  // Global error handling for the IO instance
  io.engine.on("connection_error", (err) => {
    console.log('❌ IO Connection error:', err);
  });
};