
export class PhysicsSystem {
    constructor(physicsWorld, entityManager, eventBus) {
        this.physicsWorld = physicsWorld;
        this.entityManager = entityManager;
        this.eventBus = eventBus;
    }

    update(dt) {
        // physicsWorld.step(dt)

        // оновити позицію/ротацію GameObject
        // body.translation → transform.position
        // body.rotation → transform.rotation

        // обробка колізій, емісія подій:
        // eventBus.emit("collision:start", { self, other })
    }
}
