

export class TransformSystem {
    constructor(entityManager) {
        this.entityManager = entityManager;
    }

    update(dt) {
        // пройтись по всіх ентеті
        // взяти TransformComponent
        // синхронізувати з object3D (Three.js)
        // врахувати dirty-флаг
    }
}