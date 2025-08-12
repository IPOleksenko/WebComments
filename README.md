<table>
  <tr>
    <td><img src="frontend/public/logo.svg" width="256" alt="logo"></td>
        <td>
            <h1 style="font-size: 64px;">WebComments</h1>
        </td>
  </tr>
</table>

### 🔧 Fill Environment Files

Ensure that all required environment variables are present in both `env/backend.env` and `env/frontend.env` files before proceeding.

## 📁 Git Ignore Environment Files

Prevent changes to sensitive environment files from being tracked:

```sh
git update-index --assume-unchanged env/backend.env
git update-index --assume-unchanged env/frontend.env
```

### 🔄 Restore Change Tracking

If you need to track changes again:

```sh
git update-index --no-assume-unchanged env/backend.env
git update-index --no-assume-unchanged env/frontend.env
```

## Documentation

[Tools](./Documentation/Tools.md).

[Django App](./Documentation/Django_App.md).

## ✍️ Authors

- [IPOleksenko](https://github.com/IPOleksenko) (Owner)

## 📜 License

This project is licensed under the [MIT License](./LICENSE).
