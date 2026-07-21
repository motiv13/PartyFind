# PartyFind — Player Profile

## 📌 Статус

✅ Completed

---

# Описание

Создана полноценная страница профиля игрока.

Маршрут:

```
/players/[id]
```

Каждый профиль автоматически отображает данные выбранного игрока.

---

# Реализовано

## Header

- Баннер профиля
- Аватар
- Никнейм
- Онлайн статус
- Основная игра
- Роль
- Страна
- Discord Voice статус
- ilvl / Rank

---

## About Me

Описание игрока.

Используется поле:

```ts
player.bio
```

---

## Favorite Games

Вывод любимых игр пользователя.

Используется:

```ts
player.favoriteGames
```

---

## Looking For

Отображает что сейчас ищет пользователь.

Используется:

```ts
player.lookingFor
```

---

## Languages

Список языков.

Используется:

```ts
player.languages
```

---

## Contact

Discord пользователя.

Используется:

```ts
player.discord
```

---

## Actions

Добавлены кнопки:

- Message
- Add Friend
- Invite to Party

Пока являются UI-заглушками.

---

# Архитектура

```
app/
└── players/
    └── [id]/
        └── page.tsx

components/
└── profile/
    ├── ProfileHeader.tsx
    ├── ProfileAbout.tsx
    ├── ProfileGames.tsx
    ├── ProfileLookingFor.tsx
    ├── ProfileLanguages.tsx
    ├── ProfileContact.tsx
    └── ProfileActions.tsx
```

---

# Структура Player

Каждый пользователь хранится в одном объекте.

```
Player
│
├── id
├── name
├── avatar
├── game
├── role
├── country
├── online
├── voice
├── ilvl / rank
├── bio
├── discord
├── languages
├── favoriteGames
└── lookingFor
```

---

# Что будет добавлено позже

- Настоящие игровые логотипы
- Динамический баннер по игре
- Редактирование профиля
- Достижения
- Репутация
- История активности
- Статус "Looking for Party"
- Рабочие кнопки Message / Friend / Invite

---

# Результат

Получен полноценный профиль пользователя, который готов к интеграции с базой данных и системой авторизации.